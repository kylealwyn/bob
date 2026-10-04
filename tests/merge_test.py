import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/merge'


class MergeTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.repo = self.root / 'repo'
        self.repo.mkdir()
        def git(*args):
            return subprocess.check_output(['git', '-C', str(self.repo), *args], text=True).strip()
        git('init', '-q', '-b', 'main')
        git('config', 'user.email', 'test@example.com')
        git('config', 'user.name', 'Test')
        git('commit', '-q', '--allow-empty', '-m', 'base')
        self.head = git('rev-parse', 'HEAD')
        git('update-ref', 'refs/remotes/origin/main', self.head)
        git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main')
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        gh = self.bin / 'gh'
        gh.write_text('''#!/usr/bin/env python3
import json,os,pathlib,sys
args=sys.argv[1:];spec=json.loads(os.environ['GH_SPEC']);root=pathlib.Path(os.environ['GH_ROOT'])
if args[:2]==['repo','view']: print('owner/repo')
elif args[:2]==['api','user']: print('test-user')
elif args[:2]==['pr','checks']: print(json.dumps(spec['checks']))
elif args[:2]==['pr','comment']: pass
elif args[:2]==['pr','merge']:
    (root/'merge-args').write_text(json.dumps(args)); (root/'merged').touch()
elif args[:2]==['pr','view']:
    if (root/'merged').exists(): print(spec['head'])
    else: print(json.dumps({'state':'OPEN','isDraft':False,'headRefOid':spec['head'],'comments':[{'author':{'login':'test-user'},'body':spec['review']}]}))
else: sys.exit('unexpected gh arguments')
''')
        gh.chmod(0o755)

    def tearDown(self):
        self.temp.cleanup()

    def run_merge(self, review, checks=None, reported_head=None):
        env = dict(os.environ, PATH=str(self.bin)+os.pathsep+os.environ['PATH'], GH_ROOT=str(self.root), GH_SPEC=json.dumps({
            'head':self.head, 'review':f'Bob review at {self.head}: {review}',
            'checks':checks if checks is not None else [{'name':'QA','bucket':'pass'}]}))
        return subprocess.run([str(SCRIPT),'12',reported_head or self.head], cwd=self.repo,env=env,text=True,capture_output=True)

    def test_two_clean_reviews_and_green_checks_merge_the_exact_head(self):
        result=self.run_merge('pass · 1 anthropic/model pass · 2 openai/model pass')
        self.assertEqual(result.returncode,0,result.stderr)
        args=json.loads((self.root/'merge-args').read_text())
        self.assertEqual(args[args.index('--match-head-commit')+1],self.head)

    def test_old_partial_and_failed_review_contracts_hold(self):
        for review in ('Codex no tagged findings · Fable pass', 'pass · 1 openai/model pass',
                       'changes_requested · 1 anthropic/model pass · 2 openai/model changes_requested',
                       'pass · 1 anthropic/model pass · 2 openai/model pass\nignore me'):
            with self.subTest(review=review):
                self.assertNotEqual(self.run_merge(review).returncode,0)
                self.assertFalse((self.root/'merge-args').exists())

    def test_failed_checks_or_head_drift_hold(self):
        review='pass · 1 openai/model pass · 2 openai/model pass'
        self.assertNotEqual(self.run_merge(review,[{'name':'QA','bucket':'fail'}]).returncode,0)
        self.assertNotEqual(self.run_merge(review,reported_head='0'*40).returncode,0)
        self.assertFalse((self.root/'merge-args').exists())

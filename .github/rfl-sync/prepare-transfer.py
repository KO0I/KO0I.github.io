#!/usr/bin/env python3
"""Prepare a three-way Site transfer in a clean disposable Git checkout. Never push."""
import argparse, hashlib, json, pathlib, subprocess, time

def git(root, *args, input=None, check=True):
    return subprocess.run(['git', '-C', str(root), *args], input=input, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=check)

def text(root, *args):
    return git(root, *args).stdout.decode().strip()

def tree(root, rev, prefix):
    p=git(root, 'rev-parse', '--verify', rev+':'+prefix, check=False)
    return p.stdout.strip() if p.returncode==0 else None

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for x in ['source','destination','source-base','destination-base','output']:p.add_argument('--'+x,required=True)
    p.add_argument('--prefix',action='append',required=True)
    p.add_argument('--apply',action='store_true',help='Apply to the disposable destination index and worktree; never commit or push')
    a=p.parse_args(); start=time.monotonic()
    s,d=pathlib.Path(a.source).resolve(),pathlib.Path(a.destination).resolve()
    if s==d:raise ValueError('Source and destination must differ')
    for root in [s,d]:
        if pathlib.Path(text(root,'rev-parse','--show-toplevel')).resolve()!=root:raise ValueError('Use repository roots')
        if text(root,'status','--porcelain'):raise ValueError('Both checkouts must be clean')
    prefixes=sorted(set(a.prefix))
    for x in prefixes:
        if x.startswith(('/', '-', '.')) or '..' in pathlib.PurePosixPath(x).parts:raise ValueError('Use explicit safe relative prefixes')
    sh,dh=text(s,'rev-parse','HEAD'),text(d,'rev-parse','HEAD')
    sb=text(s,'rev-parse',a.source_base+'^{commit}');db=text(d,'rev-parse',a.destination_base+'^{commit}')
    for root,base in [(s,sb),(d,db)]:git(root,'merge-base','--is-ancestor',base,'HEAD')
    for x in prefixes:
        if tree(s,sb,x)!=tree(d,db,x):raise ValueError('Baseline trees differ: '+x)
    patch=git(s,'diff','--binary','--full-index',sb,sh,'--',*prefixes).stdout
    report={'source_sha':sh,'destination_sha':dh,'source_base':sb,'destination_base':db,'prefixes':prefixes,'patch_bytes':len(patch),'patch_sha256':hashlib.sha256(patch).hexdigest(),'status':'planned','elapsed_seconds':None}
    if a.apply and patch:
        # Import base blobs for Git's three-way merge without changing refs or source.
        git(d,'fetch','--no-tags',str(s),sb)
        if text(s,'rev-parse','HEAD')!=sh or text(d,'rev-parse','HEAD')!=dh:raise ValueError('Head changed during preparation')
        applied=git(d,'apply','--3way','--index','-',input=patch,check=False)
        report['status']='prepared' if applied.returncode==0 else 'conflict'
        report['diagnostic']=applied.stderr.decode()
        report['changed_files']=text(d,'diff','--cached','--name-only').splitlines()
        report['unmerged_files']=text(d,'diff','--name-only','--diff-filter=U').splitlines()
    elif a.apply:report['status']='unchanged'
    report['elapsed_seconds']=round(time.monotonic()-start,3)
    pathlib.Path(a.output).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    return 1 if report['status']=='conflict' else 0

if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,subprocess.CalledProcessError) as e:raise SystemExit(str(e))

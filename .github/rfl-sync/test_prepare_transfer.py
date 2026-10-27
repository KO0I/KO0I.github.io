import json,pathlib,subprocess,tempfile,unittest
SCRIPT=pathlib.Path(__file__).with_name('prepare-transfer.py')
class Transfer(unittest.TestCase):
 def test_merge_preserves_destination_and_rejects_dirty_rerun(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);s=root/'s';d=root/'d';s.mkdir()
   def git(p,*a):return subprocess.check_output(['git','-C',str(p),*a],stderr=subprocess.DEVNULL,text=True).strip()
   git(s,'init');git(s,'config','user.name','test');git(s,'config','user.email','test@example.invalid')
   (s/'dist').mkdir();(s/'dist/a.txt').write_text('base\n');git(s,'add','.');git(s,'commit','-m','base');base=git(s,'rev-parse','HEAD');git(root,'clone',str(s),str(d))
   (s/'dist/a.txt').write_text('source\n');git(s,'commit','-am','source')
   git(d,'config','user.name','test');git(d,'config','user.email','test@example.invalid');(d/'README.md').write_text('retain');git(d,'add','.');git(d,'commit','-m','docs')
   cmd=['python3',str(SCRIPT),'--source',str(s),'--destination',str(d),'--source-base',base,'--destination-base',base,'--prefix','dist','--output',str(root/'r.json'),'--apply']
   subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL)
   self.assertEqual((d/'dist/a.txt').read_text(),'source\n');self.assertEqual((d/'README.md').read_text(),'retain')
   self.assertEqual(json.loads((root/'r.json').read_text())['status'],'prepared')
   self.assertNotEqual(subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode,0)
 def test_mismatched_baseline_rejected(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp)
   for name in ['s','d']:
    p=root/name;p.mkdir();subprocess.run(['git','init',str(p)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    (p/'dist').mkdir();(p/'dist/a').write_text(name)
    for args in [['config','user.name','test'],['config','user.email','test@example.invalid'],['add','.'],['commit','-m','base']]:subprocess.run(['git','-C',str(p),*args],check=True,stdout=subprocess.DEVNULL)
   cmd=['python3',str(SCRIPT),'--source',str(root/'s'),'--destination',str(root/'d'),'--source-base','HEAD','--destination-base','HEAD','--prefix','dist','--output',str(root/'r.json'),'--apply']
   r=subprocess.run(cmd,capture_output=True,text=True);self.assertNotEqual(r.returncode,0);self.assertIn('Baseline trees differ',r.stderr);self.assertEqual((root/'d/dist/a').read_text(),'d')
if __name__=='__main__':unittest.main()

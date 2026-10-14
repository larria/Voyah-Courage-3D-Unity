"""Inspect original serialized scene bindings, accepting stripped MonoBehaviour tails."""
from pathlib import Path
import struct, json, UnityPy
root=Path(__file__).resolve().parents[1]
b=(root/'unity-player/Build/ZY.data').read_bytes(); p=len(b'UnityWebData1.0\0'); end=struct.unpack_from('<I',b,p)[0];p+=4
while p<end:
 o,s,n=struct.unpack_from('<III',b,p);p+=12;name=b[p:p+n].decode();p+=n
 if name=='data.unity3d': env=UnityPy.load(b[o:o+s])
def hierarchy(go):
 parts=[go.m_Name]; active=[bool(go.m_IsActive)]
 for c in go.m_Component:
  ob=c.component.deref()
  if ob.type.name=='Transform':
   t=ob.read()
   while t.m_Father.path_id:
    t=t.m_Father.deref().read(); parent=t.m_GameObject.deref().read();parts.insert(0,parent.m_Name);active.insert(0,bool(parent.m_IsActive))
 return '/'.join(parts),active
out=[]
for obj in env.objects:
 if obj.type.name!='MonoBehaviour':continue
 try:
  d=obj.read(check_read=False); sc=d.m_Script.deref().read(); go=d.m_GameObject.deref().read()
  if sc.m_Namespace.startswith(('Configurator','Common.Car')) or sc.m_ClassName in ['API','CarConfigurator']:
   path,active=hierarchy(go)
   row={'file':obj.assets_file.name,'pathId':obj.path_id,'class':sc.m_Namespace+'.'+sc.m_ClassName,'gameObject':go.m_Name,'hierarchy':path,'activeChain':active,'enabled':d.m_Enabled,'serializedBytes':obj.byte_size}
   out.append(row);print(row)
 except Exception as ex:print('error',obj.path_id,str(ex)[:120])
(root/'verification/scene-bindings.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))

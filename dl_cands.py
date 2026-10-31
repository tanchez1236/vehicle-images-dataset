import json,os,urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image,ImageDraw
c={};[c.update(json.load(open(r"C:\Users\juanm\AppData\Local\Temp\mit_cand%s.json"%s,encoding="utf-8"))) for s in ("A","B")]
base=r"C:\Users\juanm\AppData\Local\Temp\mit_cand_all";os.makedirs(base,exist_ok=True)
jobs=[]
for key,arr in c.items():
 for i,x in enumerate(arr[:6],1): jobs.append((key,i,x))
def dl(j):
 key,i,x=j;folder=os.path.join(base,key.replace("|","_"));os.makedirs(folder,exist_ok=True);p=os.path.join(folder,str(i)+".jpg")
 try:
  req=urllib.request.Request(x["url"],headers={"User-Agent":"Mozilla/5.0"});data=urllib.request.urlopen(req,timeout=12).read();open(p,"wb").write(data);return (key,i,x["year"],p)
 except Exception as e: return (key,i,x["year"],None)
with ThreadPoolExecutor(max_workers=12) as ex: res=list(ex.map(dl,jobs))
files=[r for r in res if r[3]];print("ok",len(files),"of",len(jobs))
for start in range(0,len(files),80):
 part=files[start:start+80];cols=4;tw=260;th=210;rows=(len(part)+cols-1)//cols
 sheet=Image.new("RGB",(cols*tw,rows*th),"white");dr=ImageDraw.Draw(sheet)
 for i,(key,n,y,p) in enumerate(part):
  im=Image.open(p).convert("RGB");im.thumbnail((tw-6,th-22));x=(i%cols)*tw;yy=(i//cols)*th;sheet.paste(im,(x+3,yy+18));dr.text((x+3,yy+2),key+" #"+str(n)+" "+str(y),fill="black")
 sheet.save(r"C:\Users\juanm\AppData\Local\Temp\mit_all_contact_%d.jpg"%(start//80),quality=80)
 print(start//80,len(part),sheet.size)

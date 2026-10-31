from PIL import Image,ImageDraw
import glob,os
files=sorted(glob.glob(r"C:\Users\juanm\AppData\Local\Temp\mit_cand_all\*\*.jpg"))
for si in range(0,len(files),60):
 part=files[si:si+60];cols=4;tw=260;th=210;rows=(len(part)+cols-1)//cols
 sheet=Image.new("RGB",(cols*tw,rows*th),"white");dr=ImageDraw.Draw(sheet)
 for i,p in enumerate(part):
  key=os.path.basename(os.path.dirname(p));n=os.path.basename(p);im=Image.open(p).convert("RGB");im.thumbnail((tw-6,th-22));x=(i%cols)*tw;yy=(i//cols)*th;sheet.paste(im,(x+3,yy+18));dr.text((x+3,yy+2),key+" #"+n,fill="black")
 sheet.save(r"C:\Users\juanm\AppData\Local\Temp\mit_all_%d.jpg"%(si//60),quality=80);print(si//60,len(part),sheet.size)

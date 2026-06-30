import re

path = r'c:\Users\AVASA\Downloads\OpenC\lvzday4\src\app\wizard\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('helpText="', 'message="')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

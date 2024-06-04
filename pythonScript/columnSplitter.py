# from operator import index
import sys,json
import pandas as pd

# df=pd.DataFrame(json.loads(sys.argv[1]))
df = pd.read_csv(sys.argv[1]) 
df.reset_index()

b=json.loads(sys.argv[2])
vals={}
for i in range(0,len(b)):
    vals[i]=b[i]

# df[['Street', 'Site', 'State']] =df['Company_Code'].str.split('_', expand=True).rename(columns={0:'A', 1:'B', 2:'C'} ,inplace=True)
# df['Company_Code'].str.split('_', expand=True).rename(columns={0:'A', 1:'B', 2:'C'} ,inplace=True)
df1=df[sys.argv[4]].str.split(sys.argv[3],n=(len(b)-1), expand=True).rename(columns=vals).fillna("")

df=df.join(df1)

# removing null values to avoid errors  
df.fillna('',inplace = True)
print(df.to_json(orient='records'))



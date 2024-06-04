
import sys,json
import pandas as pd

val=json.loads(sys.argv[3])

# df=pd.DataFrame(json.loads(sys.argv[1]))
df = pd.read_csv(sys.argv[1]) 
df.reset_index()

df[json.loads(sys.argv[2])] = df[json.loads(sys.argv[2])].astype(str).apply(lambda x: x if len(x) == val else x.str.pad(val,side='left',fillchar='0'))
# df[json.loads(sys.argv[2])] = df[json.loads(sys.argv[2])].astype(str).apply(lambda x: x.str.pad(val,side='left',fillchar='0') if len(x)<val else x)
df[json.loads(sys.argv[2])] = df[json.loads(sys.argv[2])].astype(str).apply(lambda x: x if len(x) == val else x.str.slice(0,val))

# removing null values to avoid errors  
df.fillna('',inplace = True)

print(df.to_json(orient='records'))




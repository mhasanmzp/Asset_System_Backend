# from operator import index
import sys,json
import pandas as pd

# df=pd.DataFrame(json.loads(sys.argv[1]))
df = pd.read_csv(sys.argv[1])
df.reset_index()
df[sys.argv[2]] = df[sys.argv[3]].str.cat(df[json.loads(sys.argv[4])].astype(str), sep=sys.argv[5])

# removing null values to avoid errors  
df.fillna('',inplace = True)

print(df.to_json(orient='records'))



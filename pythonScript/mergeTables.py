# from operator import index
import sys,json
import pandas as pd
from functools import reduce

df=json.loads(sys.argv[1])
dataframes=[]
for p in df:
    # df1=pd.DataFrame(p)
    df1 = pd.read_csv(p)
    df1.reset_index()
    # dataframes.append(df1.to_json(orient='records'))
    dataframes.append(df1)

data_merge = reduce(lambda left, right:pd.merge(left , right,on = [sys.argv[2]],how = "inner"),dataframes).fillna("")
print(data_merge.to_json(orient='records'))
# df.reset_index()


import sys,json
import pandas as pd

sheetName=sys.argv[1]
operationToPerform=sys.argv[2]
columnsToUpdate=json.loads(sys.argv[3])

df = pd.read_csv(sheetName)
df.reset_index() 

if(operationToPerform=="Upper Case"):    
    df[columnsToUpdate] = df[columnsToUpdate].astype(str).apply(lambda col: col.str.upper())
    
if(operationToPerform=="Lower Case"):
    df[columnsToUpdate] = df[columnsToUpdate].astype(str).apply(lambda col: col.str.lower())

if(operationToPerform=="Title Case"):
    df[columnsToUpdate] = df[columnsToUpdate].astype(str).apply(lambda col: col.str.title())

# removing null values to avoid errors  
df.fillna('',inplace = True)

print(df.to_json(orient='records'))




from sqlalchemy import create_engine
import sys,json
import pandas as pd

# df=pd.DataFrame(json.loads(sys.argv[1]))
df = pd.read_csv(sys.argv[1])

# engine = create_engine('hana://DBADMIN:Hana@12345@50917f00-4c66-4be9-81c7-4a311800825c.hana.trial-us10.hanacloud.ondemand.com:443')
engine = create_engine(sys.argv[2])
df.to_sql(sys.argv[3], con=engine,if_exists='append')

print("program completed")
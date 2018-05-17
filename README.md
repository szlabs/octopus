# topological-replication
Replicate container images between multiple sites/datacenters with visual topological structured policy.

## How to run

### Start the API server
```
cd server

#~/tmp/database is the database file path
go run main.go -f ~/tmp/database

#For default, the server is started at host with port 7878
```

### Start web console
```
npm install

```


Before starting the web server, please find the file `index.d.ts` under folder `node_modules/@types/vis` and update the following interface (line 1699)

```
export interface Edge {
  from?: IdType;
  to?: IdType;
  id?: IdType;
}
```

to

```
export interface Edge {
  from?: IdType;
  to?: IdType;
  id?: IdType;
  label?: string;
}
```

```
#If the api server is started at other host, please
#update the file 'proxy.config.json' to let it point
#to the right backend API server

npm start
```

### Browse
Open your browser, access `http://localhost:4200`
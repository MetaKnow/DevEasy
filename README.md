# 产品研发及项目开发任务管理工具

适合小微软件开发企业或团队的“产品研发及项目开发任务管理工具”，管理架构为“计划-任务-步骤”三级管理，非常适合小微研发团队。完全使用Trae(一个基于AI的IDE)开发而成。这款工具非常适合小公司或小开发团队，用来管理内部的产品研发任务和项目开发任务，团队成员能够直观的看到自己所负责的任务和步骤，团队负责人能够直观的看到每个阶段的任务和步骤。简单、快速、直观是这个产品最大的特点！


## What Can I Do & How To Use

1、按阶段管理你的开发计划：

输入年、月、阶段，如果已经存在，则显示该年月阶段的任务；如果不存在，则可以点击"增加计划"按钮新增年月阶段。
<image src="docs/helpResource/fa161612e8ef586088d39bb4be9102f6.png">
2、添加任务：

点击蓝色按钮添加任务。例如“某系统V1.1版本研发计划”。

<image src="docs/helpResource/0426e858c2c20fe34abcbe38f140e45b.png">

3、添加步骤：

步骤是属于任务的，一个任务可以有多个步骤。

<image src="docs/helpResource/d9e93c5a1c2d5e6f681b8c736f77fd39.png">

4、删除步骤或任务:

点击步骤和任务单元格左侧的![image-20250821145035701](C:\Users\wenxi\AppData\Roaming\Typora\typora-user-images\image-20250821145035701.png)按钮，即可完成删除。如果您删除一项任务，那么这项任务下属的步骤也都会被删除！！！

5、折叠步骤：

如果步骤太多，你也可以点击![image-20250821145207231](C:\Users\wenxi\AppData\Roaming\Typora\typora-user-images\image-20250821145207231.png)按钮，把所有步骤折叠起来，这样就能清晰的看到有多少任务了。再点一下，会把所有步骤都展开哦。

<image src="docs/helpResource/299a858ad1e9b25750d370b2bb2d18e4.png">

6、删除计划：

如果你想删除当前计划，点击上方的“删除计划”按钮即可。删除后，这个计划下属的任务和步骤也会全部删除，请谨慎操作哦！！！

7、导出表格：

如果你想把当前计划导出一份表格保存，点击上方的“导出表格”按钮即可。

## Tech Stack

1、前后端分离，前端使用ReactJs开发，后端使用NodeJs开发;  
2、数据库使用MYSQL;  
3、后端服务端口默认为5000，前端端口默认为3000;


## Deployment

1、把源码clone或下载到本地;  
2、安装mysql数据库，数据库安装包请自行下载：“https://dev.mysql.com/downloads/mysql/”；  
3、安装好数据库后，推荐安装navicat数据库管理工具，安装包请自行下载：“https://www.navicat.com/en/download/navicat-premium”；  
4、在navicat中，首先新建连接，然后新建数据库，数据库名称为“developmentdashboard”（也可以起个别的名字，但是要改配置文件），字符集为“utf8mb4”；  
5、导入初始化库，把根目录下的developmentdashboard.sql导入到新建的developmentdashboard数据库中；  
6、进入backend\config\config.json，根据安装MYSQL时设置的用户名密码设置数据库连接参数，如下：

```
  {
  "development": {
    "username": "root",
    "password": "wenliu125&*",
    "database": "developmentdashboard",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "wenliu125&*",
    "database": "developmentdashboard",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "wenliu125&*",
    "database": "developmentdashboard",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

7、打开根目录下的.env文件，修改里面的数据库连接参数和前后端地址。如下：  

```
# 后端配置
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=wenliu125&*
DB_NAME=developmentdashboard
PORT=5000

# 前端配置
REACT_APP_API_URL=http://127.0.0.1:3000
```

8、分别进入frontend\src\services\taskCircleService.js和taskService.js，修改BASE_URL为实际的后端地址；

```
const BASE_URL = 'http://localhost:5000';
```

9、进入backend\app.js，将CORS中间件的origin配置为实际的前端地址，如下：   

```
app.use(cors({
  origin: 'http://localhost:3000',  // 确保与前端实际域名完全一致
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 200  // 解决某些浏览器对OPTIONS请求的处理问题
}));

// 4. 处理预检请求(OPTIONS)
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
```

10、操作系统防火墙设置中，放行前后端的端口。  
11、cd进入backend，执行"node app.js"命令，启动后端；再cd进入frontend，执行"npm start"命令，启动前端。浏览器中输入前端地址即可访问系统。
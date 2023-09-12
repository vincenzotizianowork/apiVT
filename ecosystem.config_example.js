module.exports = {
    apps: [{
        name: "apiTest_host",
        namespace: "dev",
        //cwd: "/var/www/html/api_v1",
        script: "./app.js",
        instances: 1,
        exec_mode: "cluster",
        watch: true,
        env: {
            NODE_ENV: "dev",
            PORT: 4000,
            JWT_KEY: 'xxxxxxxx'
        },
        //error_file: "./log/err.log",
        //out_file: "./log/out.log",
        //log_date_format: "YYYY-MM-DD HH:mm:ss",
        autorestart: true
    }]
};
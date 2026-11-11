// ecosystem.config.js
// Career Avsar - Production PM2 Configuration (Direct VPS Node.js Deployment)
// Target Domain: careeravsar.in / www.careeravsar.in
// Port: 3003 (bound to 127.0.0.1)

module.exports = {
  apps: [
    {
      name: "career-avsar",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003 -H 127.0.0.1",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,
    },
  ],
};

module.exports = {
  apps : [{
    name   : "AutoDNS",
    script : "./index.js",
    env_production: {
       NODE_ENV: "production",
       PORT: 3743,
    },
    env_development: {
       NODE_ENV: "development",
       PORT: 8080,
    },
    
    
    watch: true,
  }]
}
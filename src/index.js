// Requirements
const bull = require('bull');
const uuid = require('uuid')
const ip = require("ip")
const https = require('https')
const isReachable = require('is-reachable')
const isPortReachable = require('is-port-reachable')

// Spawn Redis Queue
class worker extends bull {
    constructor(){
        super('Tasks', redis = { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST })
        this.id = uuid.v4()
        this.nodeip = ip.address()
    }
}
let worker = new worker();


worker.process(function (task, done) {
    if (!task.target && !task.targets) return done(new Error('No Target Provided')); 
    if (task.targets) return done(new Error('Multi Target is currently not supported in this version.')) // Will add in future version to be able to scan whole subnets.

    var host = task.target.host
    var port = task.target.port

    switch(task.type.toLowerCase()){
        case 'port-test': {
            let test = isPortReachable(port, {host: host});
            if (test) return done({ status: true, tester: nodeip, message: `$port is open at ${host}:${port}`});
            if (!test) return done({ status: false, tester: nodeip, message: `port is closed at ${host}:${port}`});
        }
        case 'common-ports': {
            let test = {
                ftp20: isPortReachable(20, {host: host}),
                ftp21: isPortReachable(21, {host: host}),
                ssh22: isPortReachable(22, {host: host}),
                ssh2302: isPortReachable(2302, {host: host}),
                dns53: isPortReachable(53, {host: host}),
                http80: isPortReachable(80, {host: host}),
                //http8080: isPortReachable(8080, {host: host}),
                https443: isPortReachable(443, {host: host}),
                //https8443: isPortReachable(8443, {host: host}),
                tester: nodeip,
                message: "No Message"
            }
            return done(test);

            
        }
        case 'ProxmoxScan': {
            let request = https.get(`https://${task.target}:${port}/pve2/images/logo-128.png`, (res) => {
                if (res.statusCode == 200) return done({ status: true, tester: nodeip, message: `${host} has a open proxmox install: https://${host}:${port}`}); res.resume();
            }).on('error', (err) => { 
            });
        }
        default: return done(new Error('Task Failed'));
    }
});

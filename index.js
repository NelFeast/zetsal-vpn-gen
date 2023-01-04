const { init } = require("./core/Init");
const figlet = require('figlet');
const prompt = require('prompt-sync')();

(async() => {
    console.log('\x1b[31m%s\x1b[0m', figlet.textSync('ACCOUNT ZETSAL VPN', { whitespaceBreak: true }));
    let amount = prompt("Amount: ");
    console.clear();
    console.log('\x1b[31m%s\x1b[0m', figlet.textSync('ACCOUNT ZETSAL VPN', { whitespaceBreak: true }));
    for (let i = 0; i < amount; i++) {
        console.log('\x1b[34m%s\x1b[0m', `[${i+1}] Creating account...`);
        await init();
    }
    require('readline')
        .createInterface(process.stdin, process.stdout)
        .question("\nPress [Enter] to exit...", function(){
            process.exit();
    });
})();
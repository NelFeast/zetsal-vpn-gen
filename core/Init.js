const fs = require("fs");
const { default: puppeteer } = require("puppeteer");
const { proxy_server, username, password, captcha_api } = require("../config.json");
const { generateUsername } = require("unique-username-generator");
const randomEmail = require('random-email');
const Captcha = require("2captcha");

module.exports = {
    browser: null,
    page: null,

    init: async() => {
        this.browser = await puppeteer.launch(
            {
                headless: true,
                args: [
                    `--proxy-server=${proxy_server}`,
                    '--no-sandbox'
                ]
            }
        )
        this.page = await this.browser.newPage();
        
        await this.page.authenticate({
            username: username,
            password: password
        })

        await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        await this.page.goto('https://zetsal.com/register');
        await module.exports.register();
    },

    captcha_solver: async() => {
        const solver = new Captcha.Solver(captcha_api)
        
        await solver.imageCaptcha(fs.readFileSync('./captcha.png', "base64"))
            .then(async (result) => {
                await Promise.resolve()
                    .then(() => (this.page.focus('#captcha')))
                    .then(() => (this.page.keyboard.type(result.data)))
                    .then(() => (this.page.waitForSelector('#btn')))
                    .then(() => (this.page.click('#btn')))
                    .then(() => (this.page.waitForNavigation({waitUntil: ['load', 'networkidle2']})))
                    .then(() => (console.log('\x1b[32m%s\x1b[0m', '[+] Creating account success.')));
            })
        .catch(async (err) => {
            console.log('\x1b[31m%s\x1b[0m', '[-] Creating account failed.');
            this.browser.close();
            await module.exports.init();
        })
    },

    register: async() => {
        function makePassword(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^*()_-';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return generateUsername('', 3)+result;
        }
        let username = generateUsername('', 3);
        let email = randomEmail({ domain: 'gmail.com' });
        let password = makePassword(5);

        await Promise.resolve()
            .then(() => (this.page.focus('#username')))
            .then(() => (this.page.keyboard.type(username)))
            .then(() => (this.page.focus('#email')))
            .then(() => (this.page.keyboard.type(email)))
            .then(() => (this.page.focus('#password')))
            .then(() => (this.page.keyboard.type(password)))
            .then(() => (this.page.focus('#password2')))
            .then(() => (this.page.keyboard.type(password)))
            .then(() => (this.page.waitForSelector('#cap')))
            .then((captcha) => (captcha.screenshot({ path: './captcha.png' })));
        await module.exports.captcha_solver();
        await module.exports.login(username, password);
    },

    login: async(username, password) => {
        await Promise.resolve()
            .then(() => (this.page.focus('#username')))
            .then(() => (this.page.keyboard.type(username)))
            .then(() => (this.page.focus('#password')))
            .then(() => (this.page.keyboard.type(password)))
            .then(() => (this.page.waitForSelector('#btn')))
            .then(() => (this.page.click('#btn')))
            .then(() => (this.page.goto('https://zetsal.com/plans')))
            .then(() => (this.page.waitForSelector('body > .slim-mainpanel > .container > .alert > .btn')))
            .then(() => (this.page.click('body > .slim-mainpanel > .container > .alert > .btn')))
            .then(() => (this.page.$eval('body > div.slim-mainpanel > div > div.row > div > div:nth-child(1) > center > i', el => el.classList.contains("fa-meh-o"))))
            .then((status) => (status ? console.log('\x1b[31m%s\x1b[0m', "[-] Free trial not accepted.") : console.log('\x1b[32m%s\x1b[0m', "[+] Free trial accepted.")))
            .then(() => (fs.writeFileSync('./result.txt', `${username}:${password}\r\n`, {flag: 'a+'})))
            .then(() => (this.browser.close()));
    }
}
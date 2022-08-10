const qrcode = require('qrcode-terminal')
const chalk = require ("chalk")
const readline = require ("readline")
const fs = require("fs")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});


//WARNING! BAD CODE

let number = "0";

console.log(chalk.green("whatsapp-web.js by pedroslopez"))

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.clear();
    init();
});

function init() {
    rl.question("Insert number to message (format +xxAAABBCCDD): ", n => {
        if (n.startsWith("+") && n.length == 12 || (!n.startsWith("+")) && n.length == 11) {
            if (n.startsWith("+")) number = n; else number = "+" + n;
            main();
        } else init();
    })
}


function showInfo(phoneNumber, mode) {
    mode = mode || ""
    console.clear()
    console.log((chalk.green("Number: ") + chalk.blue(`${number.substring(0,3)} ${number.substring(3,6)} ${number.substring(6,8)} ${number.substring(8,10)} ${number.substring(10)}`)) + chalk.red(` [Chat ID: ${chalk.bold(genChatID(number))}]\n`))
    if (mode != "") console.log(chalk.blue(`Mode: ${chalk.bold(mode)}\n`) + chalk.red("Type \"exit\" to exit!\n"))
}

function genChatID(number) {
    return number.substring(1) + "@c.us"
}

function main() {
    showInfo(number)
    rl.question("Select mode [number|send|file|exit]: ", mode => {
        switch(mode) {
            case "number":
                setNumber()
                break;
            case "send":
                send()
                break;
            case "file":
                file();
                break;
            case "exit":
                process.exit()
                break;
            default:
                break;
        }
    })

}
function setNumber() {
    showInfo(number, "number")
    rl.question("Re enter phone number: ", n => {
        if (n.toLowerCase() == "exit") {
            main();
        } else {
            if (n.startsWith("+") && n.length == 12 || (!n.startsWith("+")) && n.length == 11) {
                if (n.startsWith("+")) number = n; else number = "+" + n;
                main();
            } else setNumber();
        }
    })
}
function send() {
    showInfo(number, "send")
    rl.question("Send message: ", msg => {
        if (msg.toLowerCase() == "exit") {
            main();
        } else {
            client.sendMessage(genChatID(number), msg);
            send()
        }
    })
}
function file() {
    showInfo(number, "file")
    rl.question("Enter name (path) of file to send: ", filename => {
        if (filename.toLowerCase() == "exit") {
            main();
        } else {
            fs.exists(filename, (e) => {
                if (!e) file();
                else {
                    fs.readFile(filename, 'utf8', function(err, data){
                        if (err) throw err;
                        for (let i = 0; i < data.split("\n").length; i++) {
                            client.sendMessage(genChatID(number), data.split("\n")[i]);
                        }
                        file()
                    });
                }
            })
        }
    })
}

client.initialize();




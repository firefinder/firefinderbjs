const moment = require('moment');
const chalk = require('chalk');

class GeneralLog {
    constructor(_displayType, notifyInternally) {
        if(notifyInternally === undefined) {
            notifyInternally = true;
        }
        this.displayType;
        let warnBC = false;
        switch(_displayType) {
            case 'minimal':
                this.displayType = 'minimal';
            break;
            case 'detailed':
                this.displayType = 'detailed';
            break;
            default:
                this.displayType = 'minimal';
                warnBC = true;
            break;
        }
        // this.logManager = new GeneralLog(this.displayType);
        if(warnBC === true && notifyInternally === true) {
            console.log(this.warnLog(`No display type was provided, using display type ${chalk.cyan(this.displayType)}`, 'internal'))
        } else if(notifyInternally === true) {
            console.log(this.infoLog(`Using display type ${chalk.cyan(this.displayType)}`, 'internal'));
        }
    }
    
    warnLog(message, type) {
        if(!type) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.yellow('[WARN]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.yellow('[WARN]')} ${message}`;
            }
        } else if(type === 'internal') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        } else if(type === 'ws') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[WEBSOCKET]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[WEBSOCKET]')} ${message}`;
            }
        }
    }

    infoLog(message, type) {
        if(!type) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.green('[INFO]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.green('[INFO]')} ${message}`;
            }
        } else if(type === 'internal') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        } else if(type === 'ws') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[WEBSOCKET]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[WEBSOCKET]')} ${message}`;
            }
        }
    }
    
    errorLog(message, type) {
        if(!type) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.red('[ERROR]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`
            }
            else if(this.displayType === 'minimal') {
                return `${chalk.red('[ERROR]')} ${message}`;
            }
        } else if(type === 'internal') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`
            }
            else if(this.displayType === 'minimal') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        } else if(type === 'ws') {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[WEBSOCKET]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`
            }
            else if(this.displayType === 'minimal') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[WEBSOCKET]')} ${message}`;
            }
        }
    }
}

module.exports = GeneralLog;

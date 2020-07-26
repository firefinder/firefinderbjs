const moment = require('moment');
const chalk = require('chalk');

/**
 * GeneralLog is the manager for all logs.
 * @param {Message} message The message used for the log.
 * @param {?displayType} displayType The display method returned for the log.
 * @param {?internal} internal Whether or not the function is being called internally.
*/

class GeneralLog {
    constructor(_displayType) {
        // this.message = message;
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
        if(warnBC === true) {
            console.log(this.warnLog(`No display type was provided, using display type ${chalk.cyan(this.displayType)}`, true))
        } else {
            console.log(this.infoLog(`Using display type ${chalk.cyan(this.displayType)}`, true));
        }
    }
    
    warnLog(message, internal) {
        if(!internal) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.yellow('[WARN]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.yellow('[WARN]')} ${message}`;
            }
        } else {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.yellow('[WARN]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        }
    }

    infoLog(message, internal) {
        if(!internal) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.green('[INFO]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.green('[INFO]')} ${message}`;
            }
        } else {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`;
            } 
            else if(this.displayType === 'minimal') {
                return `${chalk.green('[INFO]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        }
    }
    
    errorLog(message, internal) {
        if(!internal) {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.red('[ERROR]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`
            }
            else if(this.displayType === 'minimal') {
                return `${chalk.red('[ERROR]')} ${message}`;
            }
        } else {
            if(!message) return console.log(errorLog('No message was provided to use.'));

            if(this.displayType === 'detailed') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[INTERNAL]')} ${chalk.gray(`[${moment().format('HH:mm:ss DD/MM/YY')}]`)} ${message}`
            }
            else if(this.displayType === 'minimal') {
                return `${chalk.red('[ERROR]')} ${chalk.cyan('[INTERNAL]')} ${message}`;
            }
        }
    }
}

module.exports = GeneralLog;
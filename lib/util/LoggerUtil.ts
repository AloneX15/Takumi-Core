import { createLogger, format, transports, Logger } from 'winston'
import { SPLAT } from 'triple-beam'
import { DateTime } from 'luxon'
import { inspect } from 'util'

export class LoggerUtil {

    public static getLogger(label: string): Logger {
        return createLogger({
            format: format.combine(
                format.label(),
                format.colorize(),
                format.label({ label }),
                format.printf(info => {
                    if(info[SPLAT]) {
                        const splat = info[SPLAT] as unknown[]
                        if(Array.isArray(splat) && splat.length === 1 && splat[0] instanceof Error) {
                            const err: Error = splat[0]
                            const msg = info.message as string
                            if(msg.length > err.message.length && msg.endsWith(err.message)) {
                                 
                                info.message = msg.substring(0, msg.length - err.message.length)
                            }
                        } else if(Array.isArray(splat) && splat.length > 0) {
                             
                            const msg = info.message as string
                            info.message = msg + ' ' + splat.map((it: unknown) => {
                                if (typeof it === 'object' && it != null) {
                                    return inspect(it, false, null, true)
                                }
                                return String(it)
                            }).join(' ')
                        }
                    }
                    return `[${DateTime.local().toFormat('yyyy-MM-dd TT').trim()}] [${info.level}] [${info.label}]: ${info.message}` +
    (typeof info.stack === 'string' ? `\n${info.stack}` : '')
                })
            ),
            level: process.env.NODE_ENV === 'test' ? 'emerg' : 'debug',
            transports: [
                new transports.Console()
            ]
        })
    }

}
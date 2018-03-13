import moment from 'moment'
import pad from 'pad'
import { EventEmitter2 } from 'eventemitter2'
import {
    RtmClient,
    WebClient,
    CLIENT_EVENTS,
    RTM_EVENTS
} from '@slack/client'

export default class Workspace extends EventEmitter2 {

    constructor(token, index, max_workspace_length) {

        super()

        this.index = index

        this.max_workspace_length = max_workspace_length

        this.appData = {
            users    : {},
            channels : {},
            dms      : {},
            group_dms: {}
        }

        this.rtm = new RtmClient(token, {
            dataStore    : this.appData,
            useRtmConnect: true
        })
        this.web = new WebClient(token)
        this.updateUserList()
        this.updateChannelList()
        this.updateDMList()
        this.updateGroupDMList()

        this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, this.onAuthenticated.bind(this))
        this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, this.onConnectionOpened.bind(this))
        this.rtm.on(CLIENT_EVENTS.RTM.WS_CLOSE, this.onWebSocketClose.bind(this))
        this.rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, this.onError.bind(this))
        this.rtm.on(RTM_EVENTS.MESSAGE, this.onMessage.bind(this))
    }

    updateChannelList() {
        this.web.channels.list()
            .then((res) => {
                res.channels.forEach(c => {
                    this.appData.channels[c.id] = c
                })
            })
            .catch(console.error)
    }

    updateDMList() {
        this.web.im.list()
            .then((res) => {
                res.ims.forEach(d => {
                    this.appData.dms[d.id] = d
                })
            })
    }

    updateGroupDMList() {
        this.web.mpim.list()
            .then((res) => {
                res.groups.forEach(g => {
                    this.appData.group_dms[g.id] = g
                })
            })
    }

    updateUserList() {
        this.web.users.list()
            .then((res) => {
                // `res` contains information about the channels
                res.members.forEach(u => {
                    // console.log(u)
                    this.appData.users[u.id] = u
                })
            })
            .catch(console.error)
    }

    onAuthenticated(connectData) {
        this.name = connectData.team.name
        this.appData.selfId = connectData.self.id
        this.log(`Logged in as ${this.appData.selfId} of team ${connectData.team.name}(${connectData.team.id})`)
    }

    onConnectionOpened() {
        this.log(`Opened connection`)
    }

    onWebSocketClose() {
        this.log('Closed connection')
    }

    onError(e) {
        this.log(`error ${e}`)
    }

    onMessage(message) {
        if (!message.text) return

        const user = this.appData.users[message.user]
            ? this.appData.users[message.user]
            : 'undefined user'
        const channel = this.getChannel(message.channel)
        let msg = this.parseMessage(message.text)

        this.output(channel, user, msg)
    }

    parseMessage(msg) {
        msg = msg.replace(/<@(U[[A-Z0-9]+)>/g, (whole, user_id) => {
            let user = this.appData.users[user_id]
            return `@${user.name}`
        })
        msg = msg.replace(/<(https?.+)>/g, (whole, url) => {
            return url
        })
        return msg
    }

    getChannel(channel) {
        switch (channel.charAt(0)) {
            case 'C':
                return `#${this.appData.channels[channel].name}`
            case 'D':
                const dm = this.appData.dms[channel]
                const user = this.appData.users[dm.user]
                return `@${user.name}`
            case 'G':
                const gdm = this.appData.group_dms[channel]
                let users = []
                gdm.members.forEach(u => {
                    users.push(`@${this.appData.users[u].name}`)
                })
                return users.join(',')
            default:
                return 'Undefined Channel'
        }
    }

    log(msg) {
        this.emit('LOG', {
            workspace: this.workspace_name,
            message: msg,
            time: this.now
        })
        // console.log(`${this.workspace_name} ${this.now} ${msg}`)
    }

    output(channel, user, msg) {
        this.emit('MESSAGE', {
            workspace: this.workspace_name,
            channel: channel,
            user: user,
            message: msg,
            time: this.now
        })
        // console.log(`${this.workspace_name} ${this.now} ${msg}`)
    }

    start() {
        this.rtm.start()
    }

    get workspace_name() {
        return this.name
    }

    get now() {
        return moment().format('HH:mm')
    }
}

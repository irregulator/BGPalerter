import Connector from "./connector";
import {AS, Path} from "../model";


export default class ConnectorDemo extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.updates = [
          [
            1000,
            "Let Google AS15169 announce Exoscale's 159.100.248.0/21",
            {
              data: {
                announcements: [{
                    prefixes: ["159.100.248.0/21"],
                    next_hop: "124.0.0.3"
                }],
                peer: "124.0.0.3",
                path: [1, 2, 3, 15169]
              },
              type: "ris_message"
              },
          ],
          [
            10000,
            "Let Exoscale announce a more specific prefix than 159.100.248.0/21",
            {
              data: {
                announcements: [{
                    prefixes: ["159.100.251.0/24"],
                    next_hop: "124.0.0.2"
                }],
                peer: "124.0.0.2",
                path: [1, 2, 3, 61098]
              },
              type: "ris_message"
            },
          ],
          [
            20000,
            "Let Exoscale withdraw 2a04:c44::/32",
            {
              data: {
                withdrawals: ["2a04:c44::/32"],
                peer: "124.0.0.2",
              },
              type: "ris_message"
            },
          ],
          [
            30000,
            "Let Exoscale announce a Cloudflare prefix 103.21.244.0/24, which is also backed by RPKI",
            {
              data: {
                announcements: [{
                    prefixes: ["103.21.244.0/24"],
                    next_hop: "124.0.0.2"
                }],
                peer: "124.0.0.2",
                path: [1, 2, 3, 61098]
              },
              type: "ris_message"
            },
          ],

        ]
    };

    connect = () => {
        this._connect("Exoscale Demo connector connected");
        return Promise.resolve();
    };


    subscribe = () => {
      this.updates.forEach(update => {
        setTimeout(() => {
          console.log("\x1b[32m%s\x1b[0m", 'Trigger: '+ update[1]);
          this._message(update[2]);
        }, update[0]);
      });
    };

    static transform = (message) => {
        if (message.type === 'ris_message') {
            message = message.data;
            const components = [];
            const announcements = message["announcements"] || [];
            const withdrawals = message["withdrawals"] || [];
            const aggregator = message["aggregator"] || null;
            const peer = message["peer"];

            for (let announcement of announcements){
                const nextHop = announcement["next_hop"];
                const prefixes = announcement["prefixes"] || [];
                let path = new Path(message["path"].map(i => new AS(i)));
                let originAS = path.getLast();

                for (let prefix of prefixes){
                    components.push({
                        type: "announcement",
                        prefix,
                        peer,
                        path,
                        originAS,
                        nextHop,
                        aggregator
                    })
                }
            }

            for (let prefix of withdrawals){
                components.push({
                    type: "withdrawal",
                    prefix,
                    peer
                })
            }

            return components;
        }
    };
}

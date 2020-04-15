import Gun from 'gun/gun.js'

// Object.defineProperty(exports, "__esModule", { value: true });
import { AsyncStorage } from 'react-native';
class Adapter {
    constructor(db) {
        this.db = db;
        // Preserve the `this` context for read/write calls.
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
    }
    read(context) {
        const { get, gun } = context;
        const { "#": key } = get;
        const done = (err, data) => {
            this.db.on("in", {
                "@": context["#"],
                put: Gun.graph.node(data),
                //not needed. this solves an issue in gun https://github.com/amark/gun/issues/877
                _: function () { },
                err
            });
        };
        AsyncStorage.getItem(key, (err, result) => {
            if (err) {
                done(err);
            }
            else if (result === null) {
                // Nothing found
                done(null);
            }
            else {
                done(null, JSON.parse(result));
            }
        });
    }
    write(context) {
        const { put: graph, gun } = context;
        const keys = Object.keys(graph);
        const instructions = keys.map((key) => [
            key,
            JSON.stringify(graph[key])
        ]);
        AsyncStorage.multiMerge(instructions, (err) => {
            this.db.on("in", {
                "@": context["#"],
                ok: !err || err.length === 0,
                err
            });
        });
    }
}

Gun.on("create", (db) => {
    const adapter = new Adapter(db);
    // Allows other plugins to respond concurrently.
    const pluginInterop = (middleware) => function (ctx) {
        this.to.next(ctx);
        return middleware(ctx);
    };
    // Register the adapter
    db.on("get", pluginInterop(adapter.read));
    db.on("put", pluginInterop(adapter.write));
});
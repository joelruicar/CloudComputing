import { connect, StringCodec } from 'nats'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function observer() {
    const nats_hostname = "192.168.1.5"

    const MAX_MSGS_ALERT = 10
    const MIN_MSGS_ALERT = 0
    const MS_TO_MIN = 1000 * 60
    const MINUTES = 1
    const COUNTER_MAX_ALERT = 5
    const COUNTER_MIN_ALERT = 5

    var counter_max = 0
    var counter_min = 0

    var myObj = { foo: 0, foo2: 0};

    const nc = await connect({ servers: nats_hostname });
    console.log(`connected to ${nc.getServer()}`);

    let sub = nc.subscribe("cola");

    // Ejemplo de consumo de mensajes ralentizado para comprobar como el número de mensajes en la cola cambia con el tiempo

    // const done = (async () => { 
    //     for await (const msg of sub) {
    //       console.log(`${msg.string()} on subject ${msg.subject}`);
    //       await sleep(2000)
    //     }
    //   })()

    const js = await nc.jetstream();
    const sc = StringCodec();
    const kv = await js.views.kv("Observer");

    while (true) {
        var pending = sub.getPending()

        console.log("PENDING: " + pending);
        var date = new Date()
        var fecha = date.toISOString().toString()
        fecha = fecha.replaceAll(":", "_")
        fecha = fecha.replaceAll(".", "_")
        console.log(fecha)

        if (pending >= MAX_MSGS_ALERT)
            counter_max++
        else if (pending == MIN_MSGS_ALERT)
            counter_min++
        else {
            counter_min = 0
            counter_max = 0
            try {
                await kv.create(fecha, sc.encode("NO NEED FOR SCALABILITY ACTIONS"));
            } catch (err) {
                console.log("Error on KV entry creation")
            }
        }

        if (counter_max >= COUNTER_MAX_ALERT) {
            console.log("QUEUE MAXIMUM LIMIT EXCEEDED! SCALE UP ACTIONS NEEDED")
            try {
                await kv.create(fecha, sc.encode("QUEUE MAXIMUM LIMIT EXCEEDED! SCALE UP ACTIONS NEEDED"));
            } catch (err) {
                console.log("Error on KV entry creation")
            }
        }

        if (counter_min >= COUNTER_MIN_ALERT) {
            console.log("QUEUE MINIMUM LIMIT MET! SCALE DOWN ACTIONS SUGGESTED")
            try {
                await kv.create(fecha, sc.encode("QUEUE MINIMUM LIMIT MET! SCALE DOWN ACTIONS SUGGESTED"));
            } catch (err) {
                console.log("Error on KV entry creation")
            }
        }

        await sleep(MINUTES * MS_TO_MIN)
        // await sleep(1000)
    }
}

observer()
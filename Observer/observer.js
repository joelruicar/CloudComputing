import { connect, StringCodec } from 'nats'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function observer(){
    const MAX_MSGS_ALERT = 10
    const MIN_MSGS_ALERT = 0
    const MS_TO_MIN = 1000 * 60
    const MINUTES = 1
    const COUNTER_MAX_ALERT = 5
    const COUNTER_MIN_ALERT = 5

    var counter_max = 0
    var counter_min = 0

    while(true){
        const response = await fetch("http://localhost:8222/varz");
        const stats = await response.json();
        var pending = stats.in_msgs - stats.out_msgs

        console.log("PENDING: " + pending);

        if(pending >= MAX_MSGS_ALERT)
            counter_max++
        else
            counter_max = 0

        if(pending == MIN_MSGS_ALERT)
            counter_min++
        else
            counter_min = 0

        if(counter_max >= COUNTER_MAX_ALERT)
            console.log("QUEUE MAX LIMIT EXCEEDED! SCALE UP NEEDED")

        if(counter_min >= COUNTER_MIN_ALERT)
            console.log("QUEUE MIN LIMIT MET! SCALE DOWN SUGGESTED")

        // await sleep(MINUTES * MS_TO_SECS)
        await sleep(1000)
    }
}

async function testpublish(){
    const nc = await connect({ servers: "localhost"});
    const sc = StringCodec();
    
    var pendingBytes, pendingMessages

    while(true){
        console.log("Test")
        nc.publish("cola", sc.encode("Test"));
        await sleep(2000)
    }
}

observer()
// testpublish()
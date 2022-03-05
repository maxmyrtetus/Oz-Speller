import React, { useEffect, useState } from "react";
import FlickerBox from "../shared/FlickerBox";
import './FlashingPage.css';
import socketIOClient from "socket.io-client";

function FlashingPage() {
    const [ops, setOps] = useState(false);
    const [pred, setPred] = useState("");
    const [inter, setInter] = useState(0);

    let socket = null;
    let config = null;

    useEffect(() => {
        let flashing_promise = null;
        let canTrial = true;
        socket = socketIOClient("http://localhost:4002");
        socket.emit('frontend ready');

        socket.on('frontend_config', (data) => {
            config = data;
        });
        
        socket.on('start_flashing', (trial) => {
            socket.emit('get next trial', false)
            setPred(trial);
        
            var now = new Date();
            console.log("finished flashing:" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());
            socket.emit("countdown start", "*")
            const countdown_promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('done')
                }, config["INTER_TRIAL_INTERVAL"]);
            })

            countdown_promise.then(r => {
                var now = new Date();
                console.log("finished countdown:" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());

                setOps(true);
                socket.emit("countdown done", trial)

                setTimeout(() => {
                    setOps(false);  // * is used as the null character
                    var now = new Date();
                    socket.emit('get next trial', true)
                }, config["TRIAL_DURATION"]);
            })
        });
    }, []);
    // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const phase = 0.2415;
    return (
        <>
        <h1 style={{textAlign: "center"}}>Trial: {pred}</h1>
        <div className="FlashingComponent">
        {
            [...characters].map((el, index) => 
            <FlickerBox 
            text={el}
            freq={index + 1}
            ops={ops}
            fps={60}
            phase={index * phase}
            key={index}
            />
            )
        }
        </div>
        </>
    )
}

export default FlashingPage;

            // console.log("BEFORE", before.getSeconds(), before.getMilliseconds())

            // console.log("AFTER", after.getSeconds(), after.getMilliseconds())
            // perform trial
            // setTimeout(() => {
            //     var now = new Date();
            //     console.log("finished countdown:" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());

            //     setOps(true);

            // }, config["INTER_TRIAL_INTERVAL"]);
            
            // setTimeout(() => {
            //     setOps(false);
            //     socket.emit('finished flashing', "*");  // * is used as the null character
            //     var now = new Date();
            //     console.log("finished flashing:" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());
            // }, config["TRIAL_DURATION"]);
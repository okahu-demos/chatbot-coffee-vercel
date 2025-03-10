// @ts-ignore
import { setupMonocle } from 'monocle2ai';

export function register() {

    console.log("Registering instrumentation")
    // this reisters monocle instrumentation
    setupMonocle(
        "chat-vercel-coffee-wf"
    )
}

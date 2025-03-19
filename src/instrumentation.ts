import { setupMonocle } from 'monocle2ai';

export function register() {

    console.log("Registering instrumentation")
    // this reisters monocle instrumentation
    setupMonocle(
        "openai.app"
    )
}

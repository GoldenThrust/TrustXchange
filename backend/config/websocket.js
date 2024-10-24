class WebSocketManager {
    constructor() {
        this.io = null;
        this.socket = null;
        this.room = null;
        this.connectionPromise = null;
        this.connected = false;
    }

    async getConnection(io) {
        this.io = io;

        this.connectionPromise = new Promise((resolve, reject) => {
            io.on("connection", (socket) => {
                if (!socket.user) {
                    console.error("Invalid user, disconnecting socket");
                    socket.disconnect();
                    reject(new Error("Invalid user"));
                    return;
                }

                this.user = socket.user;
                this.room = this.user.id.toString();
                this.socket = socket;

                socket.join(this.room);
                this.connected = true;
                socket.emit("connected");
                socket.on('quote_accepted', ()=> {
                    console.log('Quote accepted')
                    this.io.to(this.room).emit("process_quote");
                })

                console.log('Connected to WebSocket', this.room);

                socket.on("disconnect", () => {
                    console.log(`Disconnected from WebSocket`, this.room);
                    this.connected = false;
                });

                resolve(true);
            });
        });

        return this.connectionPromise;
    }

    emitQuoteStatus(status, exchangeId) {
        if (this.socket) {
            this.io.to(this.room).emit("quote_status", exchangeId, status );
        } else {
            console.error("Socket is not connected, unable to emit quote status.");
        }
    }

    emitRfqResponseStatus(message, status) {
        if (this.socket) {
            this.io.to(this.room).emit("quote_response_status", message, status);
        } else {
            console.error("Socket is not connected, unable to emit RFQ response status.");
        }
    }

    emitCloseQuote(exchangeId) {
        if (this.socket) {
            this.io.to(this.room).emit("close_quote", exchangeId);
        } else {
            console.error("Socket is not connected, unable to emit close quote.");
        }
    }
}

const websocket = new WebSocketManager();
export default websocket;

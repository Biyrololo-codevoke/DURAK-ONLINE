export default function joinRoom(ws: WebSocket | null, room_id : number, password?: string){
    if(!ws) return

    console.log(ws)

    if(ws.readyState === 0) {
        throw new Error(`ws isn't ready`)
    }

    localStorage.setItem('_room_id', String(room_id));

    const _data = JSON.stringify({
        event: 'join_room',
        room_id,
        ...(password ? {password} : {})
    })

    ws.send(_data);
}
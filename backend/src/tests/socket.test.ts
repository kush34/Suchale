import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";

jest.mock("../utils/redis");
jest.mock("../models/userModel");
jest.mock("../models/groupModel");

import redis from "../utils/redis";
import User from "../models/userModel";
import Group from "../models/groupModel";

let io: Server;
let httpServer: any;
let clientSocket: any;

beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    const socketHandler = require("../socket").default;
    socketHandler(io);

    httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`, {
            transports: ["websocket"]
        });
        clientSocket.on("connect", done);
    });
});


afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
});

test("addUser should store to redis + join groups + notify contacts", async () => {

    (redis.hset as jest.Mock).mockResolvedValue(null);
    (redis.hget as jest.Mock).mockResolvedValue(null);

    const fakeUser = {
        _id: "123",
        username: "ck",
        contacts: ["42"],
    };
    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);

    (Group.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue([
            { _id: "g1", name: "Group1" },
            { _id: "g2", name: "Group2" }
        ])
    });

    (User.findById as jest.Mock).mockResolvedValue({
        username: "contactUser"
    });

    clientSocket.emit("addUser", "ck");

    await new Promise((res) => setTimeout(res, 50));

    expect(redis.hset).toHaveBeenCalledWith("onlineUsers", "ck", expect.any(String));
    expect(redis.hset).toHaveBeenCalledWith("socketToUsername", expect.any(String), "ck");
    expect(User.findOne).toHaveBeenCalledWith({ username: "ck" });
    expect(Group.find).toHaveBeenCalledWith({ users: fakeUser._id });

});

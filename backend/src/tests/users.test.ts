// src/tests/users.test.ts
import request from 'supertest';
import bcrypt from 'bcrypt';
import server, { io } from '../index'; // adjust path
import mongoose from 'mongoose';
import redis from '../utils/redis';
import User from '../models/userModel';
import { IMessage } from '../models/messageModel';
import { IGroup } from '../models/groupModel';

interface IUser { username: string; email: string; password: string; _id?: string }

let fromUser: IUser;
let toUser: IUser;
let jwt_token: string;

// ponytail: strict CORS (#17) 500s origin-less requests — browsers always
// send Origin, so tests must too
const ORIGIN = process.env.DOMAIN_1 as string;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
});

fromUser = {
    username: 'TestUser',
    email: 'test@example.com',
    password: 'password123'
};
toUser = {
    username: 'TestUser2',
    email: 'test2@example.com',
    password: 'password123'
};

describe('User Routes', () => {
    it('creates test users directly in DB (registration is OTP-only, /user/create removed)', async () => {
        // ponytail: /user/create bypassed OTP (issue #15) — signup goes through sendOtp/verifyOtp
        for (const u of [fromUser, toUser]) {
            await User.create({ username: u.username, email: u.email, password: await bcrypt.hash(u.password, 10) });
        }
        expect(await User.countDocuments({})).toBe(2);
    });
    it('POST /user/create is gone (OTP bypass closed)', async () => {
        const res = await request(server)
            .post('/user/create')
            .set('Origin', ORIGIN)
            .send({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(404);
    });
    it('Return Error as no data is provided for registering a new user', async () => {
        const res = await request(server)
            .post('/user/create')
            .set('Origin', ORIGIN)
            .send();

        expect(res.statusCode).toBe(404);
        console.log(res.body)
    });
    it('should login a new user', async () => {
        const res = await request(server)
            .post('/user/login')
            .set('Origin', ORIGIN)
            .send({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        // token now travels in httpOnly cookie, not body (#10)
        jwt_token = (res.headers['set-cookie'] as unknown as string[])
            .find((c: string) => c.startsWith('token='))!
            .split(';')[0].split('=')[1];
    });
    it('Return Error as no username and password is provided login a new user', async () => {
        const res = await request(server)
            .post('/user/login')
            .set('Origin', ORIGIN)
            .send({
                email: 'test@example.com',
            });

        expect(res.statusCode).toBe(400);
        console.log(res.body)
    });
    it('Search Users from the Database', async () => {
        const res = await request(server)
            .post('/user/search')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({
                query: 'TestUser2',
            });

        console.log(res.body[0])
        expect(res.statusCode).toBe(200);
        // toUser = res.body[0]
    });
    it('GET User Profile / INFO', async () => {
        const res = await request(server)
            .get('/user/userInfo')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)

        console.log(res.body)
        expect(res.statusCode).toBe(200);
        // fromUser = res.body
    });
    it('POST User Add contact', async () => {
        const res = await request(server)
            .post('/user/addContact')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(400);

        const res1 = await request(server)
            .post('/user/addContact')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({ contact: 'TestUser2' })
        console.log(res1.body)
        expect(res1.statusCode).toBe(200);
    });
    it('POST User Subscribe / Notification Route', async () => {
        const res = await request(server)
            .post('/user/subscribe')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(400);

        const res1 = await request(server)
            .post('/user/subscribe')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({ subscription: { endpoint: 'dummyData/whichIsSentFromFrontendForNotification' } })
        console.log(res1.body)
        expect(res1.statusCode).toBe(200);
    });
    it('GET userList: List of all the contacts users has', async () => {
        const res = await request(server)
            .get('/user/userList')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(200);
    });

});

let sentMsg: IMessage;
let groupName = 'NewGroup';
let createdGroup: IGroup;
describe('Message Routes', () => {
    it('POST /send : create Message, error for not all required fields', async () => {
        const res = await request(server)
            .post('/message/send')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
        expect(res.statusCode).toBe(400)
    });

    it('POST /send : create Message', async () => {
        const res = await request(server)
            .post('/message/send')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({ content: 'Dil mange more (..)', toUser: toUser.username, isGroup: false, groupId: null })
        console.log(res.body)
        expect(res.statusCode).toBe(201)
        expect(res.body.content).toBe('Dil mange more (..)')
        expect(res.body.fromUser).toBe(fromUser.username)
        expect(res.body.toUser).toBe(toUser.username)
        sentMsg = res.body
    });
    it('POST /createGroup : create new group', async () => {
        // ponytail: fromUser/toUser locals never get _id — resolve real ids
        const [dbFrom, dbTo] = await Promise.all([
            User.findOne({ username: fromUser.username }),
            User.findOne({ username: toUser.username }),
        ]);
        const res = await request(server)
            .post('/message/createGroup')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({ name: groupName, users: [dbFrom!._id, dbTo!._id] })
        expect(res.statusCode).toBe(200)
        expect(res.body.newGroup.name).toBe(groupName)
        console.log(res.body)
        createdGroup = res.body.newGroup
    });
    it('POST /getMessages : fetch latest Messages', async () => {
        const res = await request(server)
            .post('/message/getMessages')
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send({ toUser: toUser.username, groupId: null, isGroup: null })
        expect(res.statusCode).toBe(200)
        console.log(res.body)
        expect(res.body.messages.length).toBeGreaterThan(0)
        expect(res.body.messages[0]).toStrictEqual(sentMsg)
        expect(res.body.hasMore).toBe(false)
    });
    it('GET /getMembers/:groupId : fetch Group Members', async () => {
        const res = await request(server)
            .post(`/message/getMembers/${createdGroup._id}`)
            .set('Origin', ORIGIN)
            .set('Cookie', `token=${jwt_token}`)
            .send()
        expect(res.statusCode).toBe(200)
        console.log(res.body)
    });

});
afterAll(async () => {
    await mongoose?.connection?.db?.dropDatabase();
    await mongoose.connection.close();
    // ponytail: real server import leaves io + redis handles open (#22)
    io.close();
    redis.disconnect();
});

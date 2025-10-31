import request from 'supertest';
import server from '../index.js';
import mongoose from 'mongoose';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
});

let jwt_token;
describe('User Routes', () => {
    it('should register a new user', async () => {
        const res = await request(server)
            .post('/user/create')
            .send({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        console.log(res.body)
        const res2 = await request(server)
            .post('/user/create')
            .send({
                username: 'TestUser2',
                email: 'test2@example.com',
                password: 'password123'
            });
        expect(res2.statusCode).toBe(200);
        console.log(res.body)
        const res1 = await request(server)
            .post('/user/create')
            .send({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123'
            });

        console.log("second request", res1.body)
        expect(res1.statusCode).toBe(401);
    });
    it('Return Error as no data is provided for registering a new user', async () => {
        const res = await request(server)
            .post('/user/create')
            .send();

        expect(res.statusCode).toBe(403);
        console.log(res.body)
    });
    it('should login a new user', async () => {
        const res = await request(server)
            .post('/user/login')
            .send({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        jwt_token = (res.body.token)
    });
    it('Return Error as no username and password is provided login a new user', async () => {
        const res = await request(server)
            .post('/user/create')
            .send({
                email: 'test@example.com',
            });

        expect(res.statusCode).toBe(403);
        console.log(res.body)
    });
    it('Search Users from the Database', async () => {
        const res = await request(server)
            .post('/user/search')
            .set('Authorization', `Bearer ${jwt_token}`)
            .send({
                query: 'TestUser',
            });

        console.log(res.body)
        expect(res.statusCode).toBe(200);
    });
    it('GET User Profile / INFO', async () => {
        const res = await request(server)
            .get('/user/userInfo')
            .set('Authorization', `Bearer ${jwt_token}`)

        console.log(res.body)
        expect(res.statusCode).toBe(200);
    });
    it('POST User Add contact', async () => {
        const res = await request(server)
            .post('/user/addContact')
            .set('Authorization', `Bearer ${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(400);

        const res1 = await request(server)
            .post('/user/addContact')
            .set('Authorization', `Bearer ${jwt_token}`)
            .send({ contact: 'TestUser2' })
        console.log(res1.body)
        expect(res1.statusCode).toBe(200);
    });
    it('POST User Subscribe / Notification Route', async () => {
        const res = await request(server)
            .post('/user/subscribe')
            .set('Authorization', `Bearer ${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(400);

        const res1 = await request(server)
            .post('/user/subscribe')
            .set('Authorization', `Bearer ${jwt_token}`)
            .send({ subscription: { endpoint: 'dummyData/whichIsSentFromFrontendForNotification' } })
        console.log(res1.body)
        expect(res1.statusCode).toBe(200);
    });
    it('GET userList: List of all the contacts users has', async () => {
        const res = await request(server)
            .get('/user/userList')
            .set('Authorization', `Bearer ${jwt_token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(200);
    });

});


afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

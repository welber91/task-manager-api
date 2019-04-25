const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDataBase} =  require('./fixtures/db')

beforeEach(setupDataBase)

test('Should signup a new user', async () =>{
    const response = await request(app)
        .post('/users')
        .send({
            name: "welber",
            email: "welber91@gmail.com",
            password: "12345678"
        }).expect(201)
    
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name: 'welber',
            email: 'welber91@gmail.com'
        }
    })

    expect(user.password).not.toBe('12345678')
})

test('Should login existing user', async () =>{
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Should not login not existing user', async ()=>{
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'notvalid123'
    }).expect(400)
})

test('Should get profile for user', async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async ()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test("Should delete account for user", async ()=>{
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user", async ()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})
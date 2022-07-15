const chai = require('chai');
const chaiHttp = require('chai-http');
const describe = require('mocha').describe;
const it = require('mocha').it;



const app = require('../app');


chai.use(chaiHttp);
chai.should();
describe('Test dell\'applicazione', () => {
	it('/dovrebbe restituire 200 OK con un body', (done) => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('body');
				done();
			});
	});

	it('/test per vedere se il servizio risponde bene alla richiesta status"', (done) => {
		chai.request(app)
			.get('/status')
			.end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('body');
                res.body.status.should.be.equal('online');
				done();
			});
	});
});

describe('Test delle api del sito', () => {
	it('Endpoint /api dovrebbe restituire 200 OK con body che indica la mancanza di un attributo', (done) => {
		chai.request(app)
			.get('/api/getreview/byid')
			.end((err, res) => {
                res.should.have.status(200);
				res.should.have.property('body');
				res.body.error.should.be.equal("attribute id not declared");
				done();
			});
	});


    it('Endpoint /api dovrebbe restituire 200 OK con body che indica la mancanza di un attributo', (done) => {
		chai.request(app)
			.get('/api/getreview/bytitle')
			.end((err, res) => {
                res.should.have.status(200);
				res.should.have.property('body');
				res.body.error.should.be.equal("attribute title not declared");
				done();
			});
	});

    
    it('Endpoint /api dovrebbe restituire 200 OK con body nel quale è presente un file json contenente le recensioni', (done) => {
		chai.request(app)
			.get('/api/getreview/bytitle/harry+potter')
			.end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('body');
                res.body.should.have.property('title');
                res.body.should.have.property('picture');
                res.body.should.have.property('esadecimal');
                res.body.should.have.property('number_of_reviews');
				done();
			});
	});
});

import "../TestHelper";
import {expect} from 'chai';
import {ConverterService} from "../../src/converter/ConverterService";
import {ObjectProperty} from "../../src/converter/decorator/ObjectProperty";


describe('ConverterService', () => {

    const converter = new ConverterService();

    class ATestConverterClassTarget {

        @ObjectProperty()
        public name: string;

        @ObjectProperty("created_at")
        public createdAt: String;

        @ObjectProperty("updated_at")
        public updatedAt: Date;
    }

    const d1 = new Date();
    const d2 = new Date();

    const objExample = {
        name: "aName",
        created_at: d1.toISOString(),
        updated_at: d2.toISOString()
    };

    const insExample = new ATestConverterClassTarget();
    insExample.name = "FFF";
    insExample.createdAt = d1.toISOString();
    insExample.updatedAt = d2;


    it('should convert data to String', () => {
        assertConverterResult(String, 'aaa');
        assertConverterResult(String, 111, '111');
    });

    it('should convert data to Number', () => {
        assertConverterResult(Number, 111);
    });

    it('should convert data to Boolean', () => {
        assertConverterResult(Boolean, 'true', true);
        assertConverterResult(Boolean, 'false', false);
        assertConverterResult(Boolean, true);
        assertConverterResult(Boolean, false);
        assertConverterResult(Boolean, 1, true);
        assertConverterResult(Boolean, 0, false);
    });

    it('should convert data to Date', () => {

        const now = new Date();
        const nowString = now.toISOString();
        const nowNumber = now.getTime();

        assertConverterResult(Date, now);
        assertConverterResult(Date, nowString, now);
        assertConverterResult(Date, nowNumber, now);
    });

    it('should convert an object to a class instance', () => {
        const ins = converter.convert(objExample, ATestConverterClassTarget);
        assertInstance(ins);
    });

    it('should convert an instance to an object', () => {
        const obj = converter.convert(insExample, Object);
        assertObject(obj);
    });

    it('should convert an array of objects to an array of class instance', () => {
        const objArr = [objExample, objExample, objExample];
        const insArr = converter.convert(objArr, Array, ATestConverterClassTarget);

        expect(insArr instanceof Array).to.be.true;
        expect(insArr.length).to.be.equal(3);

        insArr.forEach(assertInstance);
    });

    it('should convert an array of class instance to an array of objects', () => {
        const insArr = [insExample, insExample, insExample];
        const objArr = converter.convert(insArr, Array, Object);

        expect(objArr instanceof Array).to.be.true;
        expect(objArr.length).to.be.equal(3);

        objArr.forEach(assertObject);
    });

    it('should convert a map with object as value to a map with class instance as value', () => {
        const map = new Map();
        map.set('key', objExample);

        const convertedMap = converter.convert(map, Map, ATestConverterClassTarget);

        expect(convertedMap instanceof Map).to.be.true;

        const ins = convertedMap.get('key');
        assertInstance(ins);
    });

    it('should convert a map with class instance as value to a map with object as value', () => {
        const map = new Map();
        map.set('key', insExample);

        const convertedMap = converter.convert(map, Map, Object);

        expect(convertedMap instanceof Map).to.be.true;

        const obj = convertedMap.get('key');
        assertObject(obj);
    });



    function assertConverterResult(type: Function, data: any, target?: any) {

        if (typeof target === 'undefined') {
            target = data;
        }

        if (type === Date) {
            expect(converter.convert(data, type).getTime()).to.be.equal(target.getTime());
        } else {
            expect(converter.convert(data, type)).to.be.equal(target);
        }
    }

    function assertInstance(ins) {
        expect(ins).not.to.be.undefined;
        expect(ins.name).to.be.equal('aName');
        expect(ins.createdAt).to.be.equal(d1.toISOString());
        expect(ins.updatedAt.getTime()).to.be.equal(d2.getTime());
    }

    function assertObject(obj) {
        expect(obj.name).to.be.equal('FFF');
        expect(obj.created_at).to.be.equal(d1.toISOString());
        expect(obj.updated_at.getTime()).to.be.equal(d2.getTime());
    }
});
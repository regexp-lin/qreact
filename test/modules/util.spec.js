import {
  oneObject,
  extend,
  isFn,
  toLowerCase,
  inherit,
  camelize,
  getNodes,
  getChildContext,
  getComponentProps
} from "src/util";
import {
  isEventName
} from "src/event";
describe("util", function () {

  it("oneObject", function () {

    expect(oneObject("aa,bb,cc")).toEqual({
      aa: 1,
      bb: 1,
      cc: 1
    });
    expect(oneObject("")).toEqual({});
    expect(oneObject([1, 2, 3], false)).toEqual({
      1: false,
      2: false,
      3: false
    });
  });
  it("extend", function () {

    expect(extend({}, {
      a: 1,
      b: 2
    })).toEqual({
      a: 1,
      b: 2
    });
    expect(extend({
      a: 1
    }, null)).toEqual({
      a: 1
    });

  });


  it("isFn", function () {
    expect(isFn("sss")).toBe(false);
    expect(isFn(function a() {})).toBe(true);

  });

  it("isEventName", () => {
    expect(isEventName("onaaa")).toBe(false);
    expect(isEventName("onAaa")).toBe(true);
    expect(isEventName("xxx")).toBe(false);
  });

  it("toLowerCase", () => {
    expect(toLowerCase("onaaa")).toBe("onaaa");
    expect(toLowerCase("onA")).toBe("ona");
    expect(toLowerCase("onA")).toBe("ona");
  });
  it("inherit", () => {
    function A() {}

    function B() {}
    inherit(A, B);
    var a = new A;

    expect(a instanceof A).toBe(true);
    expect(a instanceof B).toBe(true);
  });

  it("camelize", function () {

    expect(typeof camelize).toBe("function");
    expect(camelize("aaa-bbb-ccc")).toBe("aaaBbbCcc");
    expect(camelize("aaa_bbb_ccc")).toBe("aaaBbbCcc");
    expect(camelize("")).toBe("");
  });

  it("getNodes", () => {
    var dom = {
      childNodes: [{}, {}, {}]
    };
    expect(getNodes(dom).length).toBe(3);
  });
  it("getChildContext", () => {
    var instance = {
      getChildContext: function () {
        return {
          a: 1
        };
      }
    };
    var b = getChildContext(instance, {
      b: 4
    });
    expect(b).toEqual({
      a: 1,
      b: 4
    });
  });
  it("getComponentProps", () => {
    function A() {

    }
    A.defaultProps = {
      title: 1
    };
    var a = getComponentProps({
      type: A,
      props: {}
    });
    expect(a).toEqual({
      title: 1
    });

    function B() {

    }
    B.defaultProps = {
      title: 1
    };
    var b = getComponentProps({
      type: B,
      props: {
        title: 3
      }
    });
    expect(b).toEqual({
      title: 3
    });
  });

  /*  it('matchInstance', () => {
          var A = function() {}
          var a = new A
         
          var C = function() {}
          var c = { statelessRender: C }
         
          expect(matchInstance(a, A)).toBe(a)
          expect(matchInstance(c, C)).toBe(c)
      })
      */
});
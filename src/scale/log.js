import "../core/format";
import "linear";
import "nice";
import "scale";

d3.scale.log = function() {
  return d3_scale_log(d3.scale.linear().domain([0, Math.LN10]), 10, d3_scale_logp, d3_scale_powp);
};

function d3_scale_log(linear, base, log, pow) {

  function scale(x) {
    return linear(log(x));
  }

  scale.invert = function(x) {
    return pow(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return linear.domain().map(pow);
    if (x[0] < 0) log = d3_scale_logn, pow = d3_scale_pown;
    else log = d3_scale_logp, pow = d3_scale_powp;
    linear.domain(x.map(log));
    return scale;
  };

  scale.base = function(_) {
    if (!arguments.length) return base;
    base = +_;
    return scale;
  };

  scale.nice = function() {
    linear.domain(d3_scale_nice(linear.domain(), d3_scale_logNice(base)));
    return scale;
  };

  scale.ticks = function() {
    var extent = d3_scaleExtent(linear.domain()),
        ticks = [];
    if (extent.every(isFinite)) {
      var b = Math.log(base),
          i = Math.floor(extent[0] / b),
          j = Math.ceil(extent[1] / b),
          u = pow(extent[0]),
          v = pow(extent[1]),
          n = base % 1 ? 2 : base;
      if (log === d3_scale_logn) {
        ticks.push(-Math.pow(base, -i));
        for (; i++ < j;) for (var k = n - 1; k > 0; k--) ticks.push(-Math.pow(base, -i) * k);
      } else {
        for (; i < j; i++) for (var k = 1; k < n; k++) ticks.push(Math.pow(base, i) * k);
        ticks.push(Math.pow(base, i));
      }
      for (i = 0; ticks[i] < u; i++) {} // strip small values
      for (j = ticks.length; ticks[j - 1] > v; j--) {} // strip big values
      ticks = ticks.slice(i, j);
    }
    return ticks;
  };

  scale.tickFormat = function(n, format) {
    if (arguments.length < 2) format = d3_scale_logFormat;
    if (!arguments.length) return format;
    var b = Math.log(base),
        k = Math.max(.1, n / scale.ticks().length),
        f = log === d3_scale_logn ? (e = -1e-12, Math.floor) : (e = 1e-12, Math.ceil),
        e;
    return function(d) {
      return d / pow(b * f(log(d) / b + e)) <= k ? format(d) : "";
    };
  };

  scale.copy = function() {
    return d3_scale_log(linear.copy(), base, log, pow);
  };

  return d3_scale_linearRebind(scale, linear);
}

var d3_scale_logFormat = d3.format(".0e");

function d3_scale_logp(x) {
  return Math.log(x < 0 ? 0 : x);
}

function d3_scale_powp(x) {
  return Math.exp(x);
}

function d3_scale_logn(x) {
  return -Math.log(x > 0 ? 0 : -x);
}

function d3_scale_pown(x) {
  return -Math.exp(-x);
}

function d3_scale_logNice(base) {
  base = Math.log(base);
  var nice = {
    floor: function(x) { return Math.floor(x / base) * base; },
    ceil: function(x) { return Math.ceil(x / base) * base; }
  };
  return function() { return nice; };
}

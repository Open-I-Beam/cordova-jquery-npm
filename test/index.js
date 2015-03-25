var should = require('chai').should(),
    scapegoat = require('../index'),
    escape = scapegoat.escape,
    unescape = scapegoat.unescape;

describe('#escape', function() {
  it('converts & into &amp;', function() {
    escape('&').should.equal('&amp;');
  });

  it('converts " into &quot;', function() {
    escape('"').should.equal('&quot;');
  });

  it('converts \' into &#39;', function() {
    escape('\'').should.equal('&#39;');
  });

  it('converts < into &lt;', function() {
    escape('<').should.equal('&lt;');
  });

  it('converts > into &gt;', function() {
    escape('>').should.equal('&gt;');
  });
});
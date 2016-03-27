'use strict';
describe('Parser', function() {
  it('process a prueba tale as expected', function(done) {
    var expected_parse = '[{"title":"Este es mi cuento sobre como hacer","description":"Y aqui viene toda una descripcion larga sobre como se ponen las cosas y como se hace de verdad software. Recordemos que podemos enviar datos","items":[{"title":"Este es otro subcuento","description":"Que tiene tambien su propia descripcion donde la descripcion puede estar mezclada"},{"title":"Y aqui va otro subcuento","description":"Que tambien tiene su descripcion como debe ser Pues viene en un mismo parrafo"},{"title":"Pero apenas termina el parrafo, comienza otro cuento","description":"Que tambien puede tener su descripcion"}]},{"title":"Que pasa si aqui ponemos otro titulo?","description":"","items":[{"title":"Pues escribamos aqui una pequenia historia","description":"Que tenga que ver con esto","items":[{"title":"Y ahora pongamos aqui otra historiecilla","description":"Que si va a ser parte del contexto Y que probablemente no tenga nada que ver"},{"title":"Pero bueno","description":""},{"title":"Esperemos que si","description":""},{"title":"Y que si se convierta en algo","description":""}]},{"title":"Y otra pequenia historia","description":"Hasta no dar mas"},{"title":"Y la proxima si tiene mas sentido","description":""}]},{"title":"Y si ponemos otro titulo?","description":""},{"title":"Y si terminamos poniendo aqui un tercer titulo?","description":""},{"title":"Y cuando la historia que estamos contando","description":"Se vuelve muy larga entonces es porque estamos haciendo las cosas mal"}]';

    fetch('tales/prueba.tale').then((response) => { return response.text(); }).then((text) => {
      expect(JSON.stringify(parse(text))).toBe(expected_parse);
      done();
    });
  });
});

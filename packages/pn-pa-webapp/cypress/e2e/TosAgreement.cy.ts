describe('TOS agreement', () => {
  
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    cy.viewport(1920, 1080);
    cy.logout();
    cy.loginWithTokenExchange();
  });

  it('Accept TOS and PRIVACY - first acceptance', () => {
    cy.intercept(/TOS/, {
      statusCode: 200,
      fixture: 'tos/tos-first-acceptance'
    });
    cy.intercept(/DATAPRIVACY/, {
      statusCode: 200,
      fixture: 'tos/privacy-first-acceptance'
    });
    cy.visit('');
    cy.contains('Per accedere, leggi e accetta l’Informativa Privacy e i Termini e condizioni d’uso.');
    cy.get('.css-xi606m > .MuiButtonBase-root').should('be.enabled').click();
  });

  it('Accept TOS and PRIVACY - no first acceptance', () => {
    cy.intercept(/TOS/, {
      statusCode: 200,
      fixture: 'tos/tos-no-first-acceptance'
    });
    cy.intercept(/DATAPRIVACY/, {
      statusCode: 200,
      fixture: 'tos/privacy-no-first-acceptance'
    });
    cy.visit('');
    cy.contains('L’Informativa Privacy e i Termini e condizioni d’uso sono cambiati. Per accedere, leggi e accetta la nuova versione.');
    cy.get('.css-xi606m > .MuiButtonBase-root').should('be.enabled').click();
  });

  it('Accepted TOS and not accepted PRIVACY', () => {
    cy.intercept(/TOS/, {
      statusCode: 200,
      fixture: 'tos/tos-accepted'
    });
    cy.intercept(/DATAPRIVACY/, {
      statusCode: 200,
      fixture: 'tos/privacy-no-first-acceptance'
    });
    cy.visit('');
    cy.contains('L’Informativa Privacy e i Termini e condizioni d’uso sono cambiati. Per accedere, leggi e accetta la nuova versione.');
    cy.get('.css-xi606m > .MuiButtonBase-root').should('be.enabled').click();
  });

  it('Not accepted TOS and accepted PRIVACY', () => {
    cy.intercept(/TOS/, {
      statusCode: 200,
      fixture: 'tos/tos-no-first-acceptance'
    });
    cy.intercept(/DATAPRIVACY/, {
      statusCode: 200,
      fixture: 'tos/privacy-accepted'
    });
    cy.visit('');
    cy.contains('L’Informativa Privacy e i Termini e condizioni d’uso sono cambiati. Per accedere, leggi e accetta la nuova versione.');
    cy.get('.css-xi606m > .MuiButtonBase-root').should('be.enabled').click();
  });
});
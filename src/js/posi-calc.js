/*
  At this point, this is a dumping ground for screen position calculations used in other projects
 */
//noinspection JSUnusedGlobalSymbols
var PosiCalc = (function () {
  /**
   * Get the x/y coordinates needed to center the dialog in the viewport.
   *
   * @param boxToCenter
   * @returns {{x, y}}
   * @private
   */
  function centerCoordinates(boxToCenter) {
    var coordinates = {};
    var scroll = scrollOffsets();
    // http://javascript.info/tutorial/coordinates ... may want to look at this for more acccurate calcs
    coordinates.x =
      (
      (
      document.documentElement.clientWidth - boxToCenter.clientWidth
      ) / 2
      ) + scroll.x;

    coordinates.y =
      (
      (
      document.documentElement.clientHeight - boxToCenter.clientHeight
      ) / 2
      ) + scroll.y;

    return coordinates;
  }

  /* from http://www.greywyvern.com/?post=331 */
  /**
   * Gets the scroll coordinates of the html page.
   *
   * @returns {*}
   * @private
   */
  function scrollOffsets() {
    var html = document.getElementsByTagName('html')[0];

    if (html.scrollTop && document.documentElement.scrollTop) {
      return {x: html.scrollLeft, y: html.scrollTop};
    } else if (html.scrollTop || document.documentElement.scrollTop) {
      return {
        x: html.scrollLeft + document.documentElement.scrollLeft,
        y: html.scrollTop + document.documentElement.scrollTop
      };
    } else if (document.body.scrollTop) {
      return {x: document.body.scrollLeft, y: document.body.scrollTop};
    }

    return {x: 0, y: 0};
  }

  return {
    centerCoordinates: centerCoordinates,
    scrollOffsets: scrollOffsets
  }
})();
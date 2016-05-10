define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/promise/all',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/json',
  'dojo/on',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/ConceptDetail.html',
  '../dialogs/ConceptEditDialog'
], function (
  declare,
  array,
  lang,
  all,
  domConstruct,
  domClass,
  domStyle,
  JSON,
  on,
  _WidgetBase,
  _TemplatedMixin,
  template,
  ConceptEditDialog
) {
  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    baseClass: 'concept-detail',
    concept: null,
    conceptId: null,
    conceptLabel: null,
    scheme: null,
    languageController: null,
    listController: null,
    conceptSchemeController: null,
    _editDialog: null,

    postCreate: function () {
      this.inherited(arguments);
      console.debug('ConceptDetail::postCreate');
    },

    startup: function () {
      this.inherited(arguments);
      console.debug('ConceptDetail::startup');

      this._setData(this.concept);
      //domStyle.set(this.conceptDetailNode, 'max-height', (this.maxHeight ? this.maxHeight + 'px' : '500px'));
    },

    _openEditDialog: function (evt) {
      console.debug('ConceptDetail::_openEditDialog');
      evt ? evt.preventDefault() : null;

      this.emit('concept.edit', {
        concept: this.concept,
        schemeId: this.scheme
      });
    },

    _deleteConcept: function(evt) {
      console.debug('ConceptDetail::_deleteConcept');
      evt ? evt.preventDefault() : null;

      this.emit('concept.delete', {
        concept: this.concept,
        schemeId: this.scheme
      });
    },

    _setData: function(concept) {

      console.log(concept);
      // set view data
      this.conceptTitleViewNode.innerHTML = '<strong>' + this.scheme + ' : ' + concept.label + '</strong>';
      this.idViewNode.innerHTML = 'ID: ' + concept.id;
      this.typeViewNode.innerHTML = 'TYPE: ' + concept.type;
      this.uriViewNode.innerHTML = 'URI: ';
      domConstruct.create('a', { href: this.concept.uri, innerHTML: this.concept.uri, target: '_blank' },
        this.uriViewNode);

      // LABELS
      if (concept.labels && concept.label.length > 0) {
        var pref = '';
        var alt = '';
        array.forEach(concept.labels, lang.hitch(this, function(label) {
          if (label.type === 'prefLabel') {
            pref += label.label + ' (' + label.language + '), ';
          }
          if (label.type === 'altLabel') {
            alt += label.label + ' (' + label.language + '), ';
          }
        }));
        if (alt.length > 2) {
          alt = alt.substring(0, alt.length - 2);
        }
        if (pref.length > 2) {
          pref = pref.substring(0, pref.length - 2);
        }
        this.preferredLabelsNode.innerHTML = pref;
        this.alternateLabelsNode.innerHTML = alt;
      }

      // NARROWER
      if (concept.narrower && concept.narrower.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Narrower' }, this.relationsListNode, 'first');
        var narrowString = '';
        array.forEach(concept.narrower, lang.hitch(this, function(narrow) {
          narrowString += '<a href="' + narrow.uri + '" target="_blank" >' + narrow.label + '</a> (' + narrow.id + '), '
        }));
        if (narrowString.length > 2) {
          narrowString = narrowString.substring(0, narrowString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: narrowString}, dt);
      }

      // BROADER
      if (concept.broader && concept.broader.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Broader' }, this.relationsListNode, 'last');
        var broadString = '';
        array.forEach(concept.broader, lang.hitch(this, function(broader) {
          broadString += '<a href="' + broader.uri + '" target="_blank" >' + broader.label + '</a> (' +
            broader.id + '), '
        }));
        if (broadString.length > 2) {
          broadString = broadString.substring(0, broadString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: broadString}, dt);
      }

      // RELATED
      if (concept.related && concept.related.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Related' }, this.relationsListNode, 'last');
        var relatedString = '';
        array.forEach(concept.related, lang.hitch(this, function(related) {
          relatedString += '<a href="' + related.uri + '" target="_blank" >' + related.label + '</a> (' +
            related.id + '), '
        }));
        if (relatedString.length > 2) {
          relatedString = relatedString.substring(0, relatedString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: relatedString}, dt);
      }

      // MEMBER OF
      if (concept.member_of && concept.member_of.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Member of' }, this.relationsListNode, 'last');
        var memberOfString = '';
        array.forEach(concept.member_of, lang.hitch(this, function(member) {
          memberOfString += '<a href="' + member.uri + '" target="_blank" >' + member.label + '</a> (' +
            member.id + '), '
        }));
        if (memberOfString.length > 2) {
          memberOfString = memberOfString.substring(0, memberOfString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: memberOfString}, dt);
      }

      // MEMBERS
      if (concept.members && concept.members.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Members' }, this.relationsListNode, 'last');
        var memberString = '';
        array.forEach(concept.members, lang.hitch(this, function(member) {
          memberString += '<a href="' + member.uri + '" target="_blank" >' + member.label + '</a> (' +
            member.id + '), '
        }));
        if (memberString.length > 2) {
          memberString = memberString.substring(0, memberString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: memberString}, dt);
      }

      // SUBORDINATE ARRAYS
      if (concept.subordinate_arrays && concept.subordinate_arrays.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Subordinate <br>arrays' }, this.relationsListNode, 'last');
        var subString = '';
        array.forEach(concept.subordinate_arrays, lang.hitch(this, function(subordinate) {
          subString += '<a href="' + subordinate.uri + '" target="_blank" >' + subordinate.label + '</a> (' +
            subordinate.id + '), '
        }));
        if (subString.length > 2) {
          subString = subString.substring(0, subString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: subString}, dt);
      }

      // SUPERORDINATES
      if (concept.superordinates && concept.superordinates.length > 0) {
        var dt = domConstruct.create('dt', { innerHTML: 'Superordinates' }, this.relationsListNode, 'last');
        var superString = '';
        array.forEach(concept.superordinates, lang.hitch(this, function(superordinate) {
          superString += '<a href="' + superordinate.uri + '" target="_blank" >' + superordinate.label + '</a> (' +
            superordinate.id + '), '
        }));
        if (superString.length > 2) {
          superString = superString.substring(0, superString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: superString}, dt);
      }

      // MATCHES
      if (concept.matches) {
        var matches = concept.matches;
        if (matches.broad && matches.broad.length > 0) {
          this._loadMatches(matches.broad, 'broad');
        }
        if (matches.narrow && matches.narrow.length > 0) {
          this._loadMatches(matches.narrow, 'narrow');
        }
        if (matches.exact && matches.exact.length > 0) {
          this._loadMatches(matches.exact, 'exact');
        }
        if (matches.close && matches.close.length > 0) {
          this._loadMatches(matches.close, 'close');
        }
        if (matches.related && matches.related.length > 0) {
          this._loadMatches(matches.related, 'related');
        }
      }

      // NOTES
      if (concept.notes && concept.notes.length > 0) {
        array.forEach(concept.notes, lang.hitch(this, function(note) {
          domConstruct.create('li', {
            lang: note.language,
            innerHTML: '<strong>' + this._capitalize(note.type) + '</strong> <em>(' + note.language +
            ')</em>: ' + note.note
          }, this.scopeNoteNode, 'last');
        }));
      } else {
        domConstruct.destroy(this.scopeNoteNode);
      }
    },

    _capitalize: function (s) {
      // returns the first letter capitalized + the string from index 1 and out aka. the rest of the string
      return s[0].toUpperCase() + s.substr(1);
    },

    _loadMatches: function(matches, matchType) {
      var dt = domConstruct.create('dt', { innerHTML: this.capitalize(matchType) }, this.matchesListNode, 'last');
      var matchString = '';
      var promises = [];
      array.forEach(matches, function (match) {
        promises.push(this.conceptSchemeController.getMatch(match, matchType).then(lang.hitch(this, function (matched) {
          matchString += '<a href="' + matched.data.uri + '" target="_blank" >' + matched.data.label + '</a>, '
        })));
      }, this);

      all(promises).then(function(res) {
        if (matchString.length > 2) {
          matchString = matchString.substring(0, matchString.length - 2);
        }
        domConstruct.create('dd', {innerHTML: matchString}, dt);
      })
    },

    capitalize: function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  });
});
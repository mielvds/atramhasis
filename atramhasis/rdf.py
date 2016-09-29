# -*- coding: utf-8 -*-
"""
Module containing utility functions dealing with RDF used by Atramhasis.

.. versionadded:: 0.6.0
"""

from rdflib import Graph
from rdflib.namespace import RDF, VOID, DCTERMS, FOAF, SKOS
from rdflib.namespace import Namespace
from rdflib.term import URIRef, Literal

from skosprovider_rdf.utils import _add_labels

FORMATS = Namespace('http://www.w3.org/ns/formats/')
SKOS_THES = Namespace('http://purl.org/iso25964/skos-thes#')


def dataset_dumper(request, registry):
    '''
    Creates a void file with information about all void Datasets in this Atramhasis instance.

    :param pyramid.request.Request request: 
    :param skosprovider.registry.Registry:
    '''
    providers = [
        x for x in registry.get_providers()
        if not any([not_shown in x.get_metadata()['subject'] for not_shown in ['external', 'hidden']])
    ]
    graph = Graph()
    graph.namespace_manager.bind("void", VOID)
    graph.namespace_manager.bind("dcterms", DCTERMS)
    graph.namespace_manager.bind("foaf", FOAF)
    graph.namespace_manager.bind("skos", SKOS)
    graph.namespace_manager.bind("skos-thes", SKOS_THES)
    duri = request.route_url('atramhasis.rdf_void_turtle_ext', _anchor='atramhasis')
    dataset = URIRef(duri)
    graph.add((dataset, RDF.type, VOID.Dataset))
    graph.add((dataset, FOAF.homepage, URIRef(request.route_url('home'))))
    graph.add((dataset, VOID.vocabulary, URIRef(DCTERMS)))
    graph.add((dataset, VOID.vocabulary, URIRef(SKOS)))
    graph.add((dataset, VOID.vocabulary, URIRef(SKOS_THES)))
    for p in providers:
        metadataset = p.metadata.get('dataset', {})
        duri = metadataset.get('uri', request.route_url('atramhasis.rdf_void_turtle_ext', _anchor=p.get_vocabulary_id()))
        pd = URIRef(duri)
        graph.add((pd, RDF.type, VOID.Dataset))
        graph.add((dataset, VOID.subset, pd))
        graph.add((pd, DCTERMS.identifier, Literal(p.get_vocabulary_id())))
        graph.add((pd, VOID.rootResource, URIRef(p.concept_scheme.uri)))
        graph.add((pd, FOAF.homepage, URIRef(request.route_url('conceptscheme', scheme_id=p.get_vocabulary_id()))))
        _add_labels(graph, p.concept_scheme, pd)
        _add_metadataset(graph, pd, metadataset)
        fmap = [
            ('rdf', FORMATS.RDF_XML, 'atramhasis.rdf_full_export_ext'),
            ('ttl', FORMATS.Turtle, 'atramhasis.rdf_full_export_turtle_ext')
        ]
        for f in fmap:
            graph.add((pd, VOID.feature, f[1]))
            dump_url = request.route_url(f[2], scheme_id=p.get_vocabulary_id())
            graph.add((pd, VOID.dataDump, URIRef(dump_url)))
    return graph


def _add_metadataset(graph, subject, metadataset):
    '''
    :param rdflib.graph.Graph graph: Graph that contains the Dataset.
    :param rdflib.term.URIRef subject: Uri of the Dataset.
    :param dict metadataset: Dictionary with metadata to add to the Dataset.
    :rtype: :class:`rdflib.graph.Graph`
    '''
    mapping = {
        'creator': {
            'predicate': DCTERMS.creator,
            'objecttype': URIRef
        },
        'publisher': {
            'predicate': DCTERMS.publisher,
            'objecttype': URIRef
        },
        'contributor': {
            'predicate': DCTERMS.contributor,
            'objecttype': URIRef
        },
        'date': {
            'predicte': DCTERMS.date
        },
        'created': {
            'predicate': DCTERMS.created
        },
        'issued': {
            'predicate': DCTERMS.issued
        },
        'license': {
            'predicate': DCTERMS.license,
            'objecttype': URIRef
        }
    }

    for k, v in mapping.items():
        if k in metadataset:
            if 'objecttype' in v:
                objecttype = v['objecttype']
            else:
                objecttype = Literal
            for ko in metadataset[k]:
                if objecttype == Literal:
                    if 'datatype' in v:
                        o = Literal(ko, datatype=v['datatype'])
                    else:
                        o = Literal(ko)
                else:
                    o = objecttype(ko)
                graph.add((subject, v['predicate'], o))
    return graph

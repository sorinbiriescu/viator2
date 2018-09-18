Main
===================================

.. automodule:: app.main
    :members:

Configuration file
------------------

Basically, it searches the default **instance** folder at the root of the project and reads the
specified configuration file. This is useful for separating configurations for tests, development
or when running on production.

.. literalinclude:: ../../../app/main.py
   :language: python
   :start-after: # doc--main.py app config
   :end-before: # enddoc--main.py app config

For further notes on the configuration file and options, please see: http://flask.pocoo.org/docs/latest/config/

Late import of blueprints
-------------------------

The reason this is imported here and not at the beginning of the document is that 
the Flask app is not instantiated yet and the import will fails. Once the app is 
created, then the blueprints can be imported

.. literalinclude:: ../../../app/main.py
   :language: python
   :start-after: # doc--main.py late blueprint import
   :end-before: # enddoc--main.py late blueprint import
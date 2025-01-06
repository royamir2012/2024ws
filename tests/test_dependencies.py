import unittest
import importlib
import pkg_resources
import sys
from packaging import version

class TestDependencyCompatibility(unittest.TestCase):
    def test_flask_sqlalchemy_compatibility(self):
        """Test Flask-SQLAlchemy and SQLAlchemy version compatibility"""
        flask_sqlalchemy = pkg_resources.get_distribution('Flask-SQLAlchemy')
        sqlalchemy = pkg_resources.get_distribution('SQLAlchemy')
        
        flask_sqlalchemy_version = version.parse(flask_sqlalchemy.version)
        sqlalchemy_version = version.parse(sqlalchemy.version)
        
        # Flask-SQLAlchemy 2.5.x requires SQLAlchemy < 2.0
        if flask_sqlalchemy_version.major == 2 and flask_sqlalchemy_version.minor == 5:
            self.assertTrue(
                sqlalchemy_version < version.parse('2.0.0'),
                f"Flask-SQLAlchemy {flask_sqlalchemy.version} requires SQLAlchemy < 2.0.0, "
                f"but found SQLAlchemy {sqlalchemy.version}"
            )

    def test_flask_werkzeug_compatibility(self):
        """Test Flask and Werkzeug version compatibility"""
        flask = pkg_resources.get_distribution('Flask')
        werkzeug = pkg_resources.get_distribution('Werkzeug')
        
        flask_version = version.parse(flask.version)
        werkzeug_version = version.parse(werkzeug.version)
        
        # Flask 2.0.x requires Werkzeug 2.0.x
        if flask_version.major == 2 and flask_version.minor == 0:
            self.assertTrue(
                werkzeug_version.major == 2 and werkzeug_version.minor == 0,
                f"Flask {flask.version} works best with Werkzeug 2.0.x, "
                f"but found Werkzeug {werkzeug.version}"
            )

    def test_import_compatibility(self):
        """Test that all required imports work correctly"""
        critical_imports = [
            ('flask', ['Flask', 'render_template', 'request', 'jsonify', 'Response']),
            ('flask_sqlalchemy', ['SQLAlchemy']),
            ('flask_cors', ['CORS']),
            ('sqlalchemy', ['func']),
            ('werkzeug.urls', ['quote']),  
        ]
        
        for module_name, items in critical_imports:
            try:
                module = importlib.import_module(module_name)
                for item in items:
                    self.assertTrue(
                        hasattr(module, item),
                        f"Module {module_name} is missing required attribute {item}"
                    )
            except ImportError as e:
                self.fail(f"Failed to import {module_name}: {str(e)}")
            except AttributeError as e:
                self.fail(f"Failed to find attribute in {module_name}: {str(e)}")

    def test_database_connection(self):
        """Test that database connections can be established"""
        try:
            from flask import Flask
            from flask_sqlalchemy import SQLAlchemy
            
            app = Flask(__name__)
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
            
            db = SQLAlchemy(app)
            
            # Try to create a simple model and table
            class TestModel(db.Model):
                id = db.Column(db.Integer, primary_key=True)
            
            with app.app_context():
                db.create_all()
                
        except Exception as e:
            self.fail(f"Database connection test failed: {str(e)}")

if __name__ == '__main__':
    unittest.main()

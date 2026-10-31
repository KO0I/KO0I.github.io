import unittest
from unittest.mock import patch
import pages_checkpoint as checkpoint

class CompletionTests(unittest.TestCase):
    def test_waits_for_dispatching_workflow_to_finish(self):
        done = {'status': 'completed', 'conclusion': 'success'}
        with patch.object(checkpoint, 'api', side_effect=[{'status': 'in_progress'}, done]), patch.object(checkpoint.time, 'sleep') as sleep:
            self.assertEqual(checkpoint.completed_run('repos/example/site', '123'), done)
            sleep.assert_called_once_with(3)

    def test_failure_is_returned_for_existing_origin_checks_to_reject(self):
        failed = {'status': 'completed', 'conclusion': 'failure'}
        with patch.object(checkpoint, 'api', return_value=failed):
            self.assertEqual(checkpoint.completed_run('repos/example/site', '123'), failed)

    def test_timeout_does_not_save_an_incomplete_run(self):
        with patch.object(checkpoint, 'api', return_value={'status': 'in_progress'}), patch.object(checkpoint.time, 'sleep'):
            with self.assertRaisesRegex(ValueError, 'timeout'):
                checkpoint.completed_run('repos/example/site', '123')

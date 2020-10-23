from ..models import Label
import pytest
from mixer.backend.django import mixer
pytestmark = pytest.mark.django_db


class TestBoard:
    def test_model(self):
        board = mixer.blend('boards.Board')
        assert board.pk == 1, 'Should create a Board instance'

    def test_str(self):
        board = mixer.blend('boards.Board')
        assert board.title == str(board), 'Should check the board name'

    def test_labels_signal(self):
        board = mixer.blend('boards.Board')
        assert Label.objects.filter(board=board).count() == 10


class TestList:
    def test_str(self):
        list = mixer.blend('boards.List')
        assert list.title == str(list), 'Should check the List name'

    def test_save(self):
        board = mixer.blend('boards.Board')
        list1 = mixer.blend('boards.List', board=board)
        list2 = mixer.blend('boards.List', board=board)
        assert list1.order == 1, 'Should create a list with order 1'
        assert list1.order == list2.order - 1, 'Should check the order number for List'
        list3 = mixer.blend('boards.List', board=board)
        list4 = mixer.blend('boards.List', board=board)
        list1.delete()
        list5 = mixer.blend('boards.List', board=board)
        assert list5.order == 5, 'Should be 5, not 4'


class TestItem:
    def test_str(self):
        item = mixer.blend('boards.Item')
        assert item.title == str(item), 'Should check the Item name'

    def test_save(self):
        list = mixer.blend('boards.List')
        item1 = mixer.blend('boards.Item', list=list)
        item2 = mixer.blend('boards.Item', list=list)
        assert item1.order == 1, 'Should create a Item with order 1'
        assert item1.order == item2.order - 1, 'Should check the order number for Item'
        item3 = mixer.blend('boards.Item', list=list)
        item4 = mixer.blend('boards.Item', list=list)
        item1.delete()
        item2.delete()
        item5 = mixer.blend('boards.Item', list=list)
        assert item5.order == 5, 'Should be 5, not 3'


class TestLabel:
    def test_model(self):
        board = mixer.blend('boards.Board')
        assert board.pk == 1, 'Should create a Label instance'

    def test_str(self):
        label = mixer.blend('boards.Label')
        assert label.title == str(label), 'Should check the Label name'


class TestComment:
    def test_model(self):
        comment = mixer.blend('boards.Comment')
        assert comment.pk == 1, 'Should create a Comment instance'


class TestAttachment:
    def test_model(self):
        attachment = mixer.blend('boards.Attachment')
        assert attachment.pk == 1, 'Should create a Attachment instance'
